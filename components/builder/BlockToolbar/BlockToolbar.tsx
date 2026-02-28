"use client";

import type { BlockType } from "@/types/editor";
import styles from "./BlockToolbar.module.css";

export type BlockToolbarProps = {
  onAddBlock?: (type: BlockType) => void | Promise<void>;
};

export const BlockToolbar = ({ onAddBlock }: BlockToolbarProps) => {
  return (
    <div className={styles.toolbarContainer}>
      <div className={styles.toolbarContent}>
        <button
          className={styles.toolButton}
          title="Text"
          onClick={() => onAddBlock?.("text")}
        >
          📝
        </button>
        <button
          className={styles.toolButton}
          title="Link"
          onClick={() => onAddBlock?.("link")}
        >
          🔗
        </button>
        <button
          className={styles.toolButton}
          title="Image"
          onClick={() => onAddBlock?.("image")}
        >
          🖼️
        </button>
      </div>
    </div>
  );
};
