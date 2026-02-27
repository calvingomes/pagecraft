"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";
import styles from "./ProfileSidebar.module.css";

export const ProfileSidebar = () => {
  const router = useRouter();
  const { username, logout } = useAuthStore();

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    router.replace("/auth");
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.profileCard}>
        <div className={styles.avatar}>{username?.[0].toUpperCase()}</div>
        <h2 className={styles.name}>{username}</h2>
        <p className={styles.bio}>Your bio here</p>
      </div>
      <button className={styles.logoutButton} onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
};
