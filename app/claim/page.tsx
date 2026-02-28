"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

/**
 * Normalize username:
 * - lowercase
 * - trim
 * - allow only a–z and 0–9
 */
const normalizeUsername = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");

export default function ClaimPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  /**
   * Auth guard
   */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace("/auth");
        return;
      }

      // user is logged in → check if username exists
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists() && snap.data().username) {
        router.replace("/editor");
        return;
      }

      // logged in AND no username → allowed on /claim
      setAuthChecked(true);
    });

    return () => unsub();
  }, [router]);

  /**
   * Live username availability check (debounced)
   */
  useEffect(() => {
    if (!username || username.length < 3) {
      setAvailable(null);
      return;
    }

    const checkAvailability = async () => {
      setChecking(true);
      const ref = doc(db, "usernames", username);
      const snap = await getDoc(ref);
      setAvailable(!snap.exists());
      setChecking(false);
    };

    const timeout = setTimeout(checkAvailability, 400);
    return () => clearTimeout(timeout);
  }, [username]);

  /**
   * Claim username (atomic)
   */
  const claimUsername = async () => {
    const user = auth.currentUser;
    if (!user || !available || claiming) return;

    setClaiming(true);

    try {
      await runTransaction(db, async (tx) => {
        const usernameRef = doc(db, "usernames", username);
        const userRef = doc(db, "users", user.uid);
        const pageRef = doc(db, "pages", username);

        const usernameSnap = await tx.get(usernameRef);

        if (usernameSnap.exists()) {
          throw new Error("Username taken");
        }

        // 1. lock username
        tx.set(usernameRef, {
          uid: user.uid,
          createdAt: serverTimestamp(),
        });

        // 2. save user profile
        tx.set(
          userRef,
          {
            username,
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );

        // 3. create page
        tx.set(pageRef, {
          uid: user.uid,
          published: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // set sensible defaults so editor and public view have initial values
          background: "page-bg-1",
          sidebarPosition: "left",
        });

        // 4. create starter blocks
        const introBlockRef = doc(collection(pageRef, "blocks"));
        const linkBlockRef = doc(collection(pageRef, "blocks"));

        tx.set(introBlockRef, {
          uid: user.uid,
          type: "text",
          order: 0,
          content: {
            text: `<p>Hi, I'm ${username} 👋</p>`,
          },
          layout: { x: 0, y: 0 },
        });

        tx.set(linkBlockRef, {
          uid: user.uid,
          type: "link",
          order: 1,
          content: {
            label: "My Website",
            url: "https://example.com",
          },
          layout: { x: 1, y: 0 },
        });
      });

      router.push("/editor");
    } finally {
      setClaiming(false);
    }
  };

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <h1>Claim your username</h1>

      <input
        value={username}
        onChange={(e) => setUsername(normalizeUsername(e.target.value))}
        placeholder="enter your username"
      />

      {checking && <p>Checking...</p>}
      {available === true && <p>✅ Available</p>}
      {available === false && <p>❌ Taken</p>}

      <button disabled={!available || claiming} onClick={claimUsername}>
        {claiming ? "Claiming..." : "Claim & Continue"}
      </button>
    </main>
  );
}
