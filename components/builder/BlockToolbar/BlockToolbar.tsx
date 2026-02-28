"use client";

import { Type, Link2, Image as ImageIcon } from "lucide-react";
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
          <Type size={18} />
        </button>
        <button
          className={styles.toolButton}
          title="Link"
          onClick={() => onAddBlock?.("link")}
        >
          <Link2 size={18} />
        </button>
        <button
          className={styles.toolButton}
          title="Image"
          onClick={() => onAddBlock?.("image")}
        >
          <ImageIcon size={18} />
        </button>
      </div>
    </div>
  );
};
