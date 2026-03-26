"use client";

import { AuthService } from "@/lib/services/auth.client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthView from "@/components/views/AuthView/AuthView";
import { useSearchParams } from "next/navigation";

export default function AuthPage() {
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
