"use client";

import { supabase } from "@/lib/supabase";
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
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });
  };

  return <AuthView handleGoogleSignIn={handleGoogleSignIn} />;
}
