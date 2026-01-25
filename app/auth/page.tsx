// app/auth/page.tsx
"use client";

import { signInWithGoogle } from "@/lib/auth";

export default function AuthPage() {
  return (
    <main>
      <button onClick={signInWithGoogle}>Continue with Google</button>
    </main>
  );
}
