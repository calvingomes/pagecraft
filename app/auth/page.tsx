"use client";

import { Suspense } from "react";
import { AuthService } from "@/lib/services/auth.client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import AuthView from "@/components/views/AuthView/AuthView";
import { PageLoader } from "@/components/ui/PageLoader/PageLoader";

function AuthPageContent() {
  const { authChecked } = useAuthGuard("auth");
  const searchParams = useSearchParams();
  const initialUsername = searchParams.get("username") ?? undefined;

  if (!authChecked) {
    return <PageLoader />;
  }

  const handleGoogleSignIn = async () => {
    await AuthService.signInWithGoogle();
  };

  return (
    <>
      <Navbar />
      <AuthView
        handleGoogleSignIn={handleGoogleSignIn}
        initialUsername={initialUsername}
      />
    </>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageContent />
    </Suspense>
  );
}
