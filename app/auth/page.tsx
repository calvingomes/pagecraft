"use client";

import { AuthService } from "@/lib/services/auth-service";
import { useAuthGuard } from "@/hooks/useAuthGuard";

import AuthView from "@/components/views/AuthView/AuthView";

export default function AuthPage() {
  const { authChecked } = useAuthGuard("auth");

  /**
   * Block render until auth is resolved
   */
  if (!authChecked) {
    return <div>Loading...</div>;
  }

  /**
   * Login action
   */
  const handleGoogleSignIn = async () => {
    await AuthService.signInWithGoogle();
  };

  return <AuthView handleGoogleSignIn={handleGoogleSignIn} />;
}
