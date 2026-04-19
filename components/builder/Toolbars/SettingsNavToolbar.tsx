"use client";
/* eslint-disable css-modules/no-unused-class */

import * as Toolbar from "@radix-ui/react-toolbar";
import { LogOut, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./Toolbar.module.css";
import { Tooltip } from "@/components/ui/Tooltip/Tooltip";

type SettingsNavToolbarProps = {
  onLogout: () => void | Promise<void>;
};

export function SettingsNavToolbar({ onLogout }: SettingsNavToolbarProps) {
  const router = useRouter();

  return (
    <div className={styles.toolbarContainer}>
      <Toolbar.Root
        className={styles.toolbarContent}
        aria-label="Settings navigation"
      >
        <Toolbar.Button
          className={`${styles.toolButton} ${styles.navButton}`}
          type="button"
          aria-label="Open editor"
          onClick={() => router.push("/editor")}
        >
          <Pencil size={16} />
          <span>Editor</span>
        </Toolbar.Button>

        <div className={styles.divider} />
        <Tooltip content="Sign out" side="top">
          <Toolbar.Button
            className={`${styles.toolButton} ${styles.logoutButton}`}
            type="button"
            onClick={onLogout}
            aria-label="Logout"
          >
            <LogOut size={18} />
          </Toolbar.Button>
        </Tooltip>
      </Toolbar.Root>
    </div>
  );
}
