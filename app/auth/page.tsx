"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePostHog } from 'posthog-js/react';
import { AuthService } from "@/lib/services/auth.client";
import { PageService } from "@/lib/services/page.client";
import { BlockService } from "@/lib/services/block.client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuthStore } from "@/stores/auth-store";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import AuthView from "@/components/views/AuthView/AuthView";
import { PageLoader } from "@/components/ui/PageLoader/PageLoader";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const { authChecked } = useAuthGuard("auth");
  const { user, setUsername: setUsernameInStore } = useAuthStore();
  const [claiming, setClaiming] = useState(false);

  const initialUsername = searchParams.get("username") ?? undefined;

  useEffect(() => {
    if (!authChecked || !user || !initialUsername || claiming) return;

    // If the user already has a username in metadata, don't claim.
    const currentUsername = user.user_metadata?.username;
    if (typeof currentUsername === "string" && currentUsername.trim().length > 0) {
      return;
    }

    const performAutomatedClaim = async () => {
      setClaiming(true);
      try {
        await PageService.claimUsername(initialUsername, user.id);
        await BlockService.createStarterBlocks(initialUsername, user.id);
        await AuthService.updateUserMetadata({ username: initialUsername });

        const provider = user.app_metadata?.provider || 'unknown';
        posthog.capture(`signup_${provider}`, { 
          username: initialUsername,
          method: provider 
        });

        setUsernameInStore(initialUsername);
        router.replace("/editor");
      } catch (error) {
        console.error("Automated claim failed:", error);
        // If it fails, let them see the auth page again (likely a conflict)
        setClaiming(false);
      }
    };

    performAutomatedClaim();
  }, [
    authChecked,
    user,
    initialUsername,
    claiming,
    router,
    setUsernameInStore,
    posthog,
  ]);

  if (!authChecked || claiming) {
    return <PageLoader label={claiming ? "Creating your page..." : undefined} />;
  }

  const handleOAuthSignIn = async (provider: "google" | "github" | "figma", username?: string) => {
    await AuthService.signInWithOAuth(provider, username);
  };

  return (
    <>
      <Navbar />
      <AuthView
        handleOAuthSignIn={handleOAuthSignIn}
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
