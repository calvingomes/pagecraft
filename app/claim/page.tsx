"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
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
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace("/auth");
        return;
      }

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
        const usernameSnap = await tx.get(usernameRef);

        if (usernameSnap.exists()) {
          throw new Error("Username taken");
        }

        tx.set(usernameRef, {
          uid: user.uid,
          createdAt: serverTimestamp(),
        });

        tx.set(
          doc(db, "users", user.uid),
          {
            username,
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
      });

      router.push("/editor");
    } finally {
      setClaiming(false);
    }
  };

  if (!authChecked) {
    return null;
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
