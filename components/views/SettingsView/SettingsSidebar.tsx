"use client";

import Image from "next/image";
import { getCacheBustedUrl } from "@/lib/utils/imageUtils";
import type { AvatarShape } from "@/types/page";
import styles from "./SettingsSidebar.module.css";

type SettingsSidebarProps = {
  username: string;
  displayName?: string;
  avatarUrl?: string;
  avatarShape?: AvatarShape;
  updatedAt?: string;
};

export function SettingsSidebar({
  username,
  displayName,
  avatarUrl,
  avatarShape = "circle",
  updatedAt,
}: SettingsSidebarProps) {
  const display = (displayName?.trim() || username).trim();
  const avatarLetter = (display[0] ?? "?").toUpperCase();
  const resolvedAvatarUrl = getCacheBustedUrl(avatarUrl, updatedAt);

  return (
    <aside className={styles.sidebar}>
      <div
        className={`${styles.avatarWrap} ${avatarShape === "square" ? styles.avatarSquare : ""}`}
      >
        {resolvedAvatarUrl ? (
          <Image
            src={resolvedAvatarUrl}
            unoptimized
            alt={display}
            width={200}
            height={200}
            className={styles.avatarImage}
          />
        ) : (
          <span className={styles.avatarLetter}>{avatarLetter}</span>
        )}
      </div>
      <h1 className={styles.title}>Settings</h1>
      <p className={styles.subtitle}>
        Manage your profile setup and preferences.
      </p>
    </aside>
  );
}
