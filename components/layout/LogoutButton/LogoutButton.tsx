"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import styles from "./LogoutButton.module.css";

export function LogoutButton() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.replace("/auth");
  };

  return (
    <button type="button" className={styles.button} onClick={handleLogout}>
      Sign out
      <ArrowRight className={styles.icon} />
    </button>
  );
}
