"use client";

import styles from "./BlockToolbar.module.css";

type BlockToolbarProps = {
  onAddBlock?: (type: string) => void;
};

export const BlockToolbar = ({ onAddBlock }: BlockToolbarProps) => {
  return (
    <div className={styles.toolbarContainer}>
      <div className={styles.toolbarContent}>
        <button className={styles.toolButton} title="Link">
          🔗
        </button>
        <button className={styles.toolButton} title="Image">
          🖼️
        </button>
        <button className={styles.toolButton} title="Grid">
          📊
        </button>
        <button className={styles.toolButton} title="Video">
          🎬
        </button>
        <button className={styles.toolButton} title="List">
          📋
        </button>
        <button className={styles.toolButton} title="Quote">
          💬
        </button>
        <button className={styles.toolButton} title="Settings">
          ⚙️
        </button>
        <button className={styles.toolButton} title="Layout">
          📐
        </button>
      </div>
    </div>
  );
};
