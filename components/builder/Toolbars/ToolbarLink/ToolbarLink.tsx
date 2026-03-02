"use client";

import { ArrowLeft, Check } from "lucide-react";
import styles from "../Toolbar.module.css";
import type { ToolbarLinkProps } from "../Toolbar.types";

export function ToolbarLink({
  linkUrl,
  onChangeLinkUrl,
  onBack,
  onCreateLink,
}: ToolbarLinkProps) {
  return (
    <div className={styles.toolbarContainer}>
      <div className={styles.toolbarContentLink}>
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
          aria-label="Back to toolbar"
        >
          <ArrowLeft size={18} />
        </button>
        <div className={styles.linkInputWrapper}>
          <input
            className={styles.linkInput}
            placeholder="Add link here"
            value={linkUrl}
            onChange={(e) => onChangeLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void onCreateLink();
              }
            }}
          />
          <button
            type="button"
            className={styles.pasteButton}
            onClick={() => void onCreateLink()}
            aria-label="Create link"
          >
            <Check size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
