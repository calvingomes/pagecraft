"use client";

import { useAuthStore } from "@/stores/auth-store";
import styles from "./ProfileSidebar.module.css";

export const ProfileSidebar = () => {
  const { user, username } = useAuthStore();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.profileCard}>
        <div className={styles.avatar}>{username?.[0].toUpperCase()}</div>
        <h2 className={styles.name}>{username}</h2>
        <p className={styles.bio}>Your bio here</p>
      </div>
    </aside>
  );
};
