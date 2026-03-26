"use client";

import { Suspense } from "react";
import { AuthService } from "@/lib/services/auth.client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useSearchParams } from "next/navigation";
import AuthView from "@/components/views/AuthView/AuthView";

function AuthPageContent() {
  const { authChecked } = useAuthGuard("auth");
  const searchParams = useSearchParams();
  const initialUsername = searchParams.get("username") ?? undefined;

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  const handleGoogleSignIn = async () => {
    await AuthService.signInWithGoogle();
  };

  return (
    <AuthView
      handleGoogleSignIn={handleGoogleSignIn}
      initialUsername={initialUsername}
    />
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageContent />
    </Suspense>
  );
}
