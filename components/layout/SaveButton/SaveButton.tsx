"use client";

import { Save } from "lucide-react";

import styles from "./SaveButton.module.css";

type SaveButtonProps = {
  onSave: () => Promise<void>;
  saving: boolean;
};

export function SaveButton({ onSave, saving }: SaveButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={onSave}
      disabled={saving}
    >
      Save
      <Save className={styles.icon} />
    </button>
  );
}
