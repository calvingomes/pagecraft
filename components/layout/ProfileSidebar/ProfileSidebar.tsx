"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";
import type { SidebarPosition } from "@/types/page";
import styles from "./ProfileSidebar.module.css";

type ProfileSidebarProps = (
  | { variant: "editor" }
  | { variant: "view"; username: string }
) & { position?: SidebarPosition };

export const ProfileSidebar = (props: ProfileSidebarProps) => {
  const router = useRouter();
  const { username: editorUsername, logout } = useAuthStore();
  const username = props.variant === "view" ? props.username : editorUsername;
  const position = props.position ?? "left";

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    router.replace("/auth");
  };

  const positionClass =
    position === "left"
      ? styles.sidebarLeft
      : position === "center"
        ? styles.sidebarCenter
        : styles.sidebarRight;

  return (
    <aside className={`${styles.sidebar} ${positionClass}`}>
      <div className={styles.profileCard}>
        <div className={styles.avatar}>{username?.[0]?.toUpperCase() ?? "?"}</div>
        <h2 className={styles.name}>{username ?? "—"}</h2>
        <p className={styles.bio}>Your bio here</p>
      </div>
      {props.variant === "editor" && (
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      )}
    </aside>
  );
};
