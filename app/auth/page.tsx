"use client";

import { signInWithGoogle } from "@/lib/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

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

  return <button onClick={handleSignIn}>Continue with Google</button>;
}
