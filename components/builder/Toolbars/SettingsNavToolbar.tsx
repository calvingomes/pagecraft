"use client";
/* eslint-disable css-modules/no-unused-class */

import * as Toolbar from "@radix-ui/react-toolbar";
import { ChartColumn, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./Toolbar.module.css";

export function SettingsNavToolbar() {
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

        <Toolbar.Button
          className={`${styles.toolButton} ${styles.navButton}`}
          type="button"
          aria-label="Open analytics"
          onClick={() => router.push("/analytics")}
        >
          <ChartColumn size={16} />
          <span>Analytics</span>
        </Toolbar.Button>
      </Toolbar.Root>
    </div>
  );
}
