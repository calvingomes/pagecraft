"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/services/auth.client";
import { useAuthStore } from "@/stores/auth-store";

type AuthGuardMode = "auth" | "editor";

const getUsernameFromUser = (user: User | null): string | null => {
  if (!user) return null;

  const username = user.user_metadata?.username;
  if (typeof username !== "string") return null;

  const trimmed = username.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export function useAuthGuard(mode: AuthGuardMode) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const setUsername = useAuthStore((s) => s.setUsername);
  const setLoading = useAuthStore((s) => s.setLoading);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let active = true;

    const applyGuard = (user: User | null) => {
      if (!active) return;

      const username = getUsernameFromUser(user);

      setUser(user);
      setUsername(username);

      if (!user) {
        setLoading(false);
        if (mode === "auth") {
          setAuthChecked(true);
        } else {
          router.replace("/auth");
        }
        return;
      }

      if (mode === "auth") {
        setLoading(false);
        if (username) {
          router.replace("/editor");
          return;
        }

        // If no username, the user should stay on the /auth page to pick one.
        setAuthChecked(true);
        return;
      }

      if (!username) {
        setLoading(false);
        router.replace("/auth");
        return;
      }

      setLoading(false);
      setAuthChecked(true);
    };

    setLoading(true);

    AuthService.getUser().then((user) => {
      applyGuard(user ?? null);
    });

    const {
      data: { subscription },
    } = AuthService.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || event === "USER_UPDATED") {
        applyGuard(session?.user ?? null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [mode, router, setLoading, setUser, setUsername]);

  return { authChecked };
}
