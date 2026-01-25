"use client";

import { signInWithGoogle } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const handleSignIn = async () => {
    await signInWithGoogle();
    router.push("/editor");
  };

  return (
    <main>
      <button onClick={handleSignIn}>Continue with Google</button>
    </main>
  );
}
