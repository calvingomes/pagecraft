"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { ArrowRight } from "lucide-react";

import { auth } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";
import styles from "./LogoutButton.module.css";

export function LogoutButton() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    router.replace("/auth");
  };

  return (
    <div className={styles.container}>
      <button type="button" className={styles.button} onClick={handleLogout}>
        Sign out
        <ArrowRight className={styles.icon} />
      </button>
    </div>
  );
}
