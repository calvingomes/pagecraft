"use client";

import { useEffect, useState } from "react";
import { signInWithGoogle, auth } from "@/lib/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  /**
   * Auth + routing guard
   */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      // not logged in → allowed to stay on /auth
      if (!user) {
        setAuthChecked(true);
        return;
      }

      // logged in → check if username exists
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists() && snap.data().username) {
        router.replace("/editor");
      } else {
        router.replace("/claim");
      }
    });

    return () => unsub();
  }, [router]);

  /**
   * Block render until auth is resolved
   */
  if (!authChecked) {
    return <div>Loading...</div>;
  }

  /**
   * Login action
   */
  const handleSignIn = async () => {
    const result = await signInWithGoogle();
    const uid = result.user.uid;

    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (snap.exists() && snap.data().username) {
      router.push("/editor");
    } else {
      router.push("/claim");
    }
  };

  return (
    <main>
      <h1>Sign in</h1>
      <button onClick={handleSignIn}>Continue with Google</button>
    </main>
  );
}
