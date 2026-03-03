"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";

type AuthGuardMode = "auth" | "claim" | "editor";

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
        router.replace(username ? "/editor" : "/claim");
        return;
      }

      if (!username) {
        setLoading(false);
        if (mode === "editor") {
          router.replace("/claim");
        } else {
          setAuthChecked(true);
        }
        return;
      }

      if (mode === "claim") {
        setLoading(false);
        router.replace("/editor");
        return;
      }

      setLoading(false);
      setAuthChecked(true);
    };

    setLoading(true);

    supabase.auth.getUser().then(({ data }) => {
      applyGuard(data.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applyGuard(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [mode, router, setLoading, setUser, setUsername]);

  return { authChecked };
}
