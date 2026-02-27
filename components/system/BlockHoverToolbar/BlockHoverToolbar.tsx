"use client";

import React from "react";
import type { BlockWidthPreset } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import styles from "./BlockHoverToolbar.module.css";

type BlockHoverToolbarProps = {
  blockId: string;
  currentPreset?: BlockWidthPreset;
  onWidthChange: (preset: BlockWidthPreset) => void;
  visible?: boolean;
};

const WIDTH_PRESETS: {
  preset: BlockWidthPreset;
  title: string;
  Icon: (props: { className?: string }) => React.ReactNode;
}[] = [
  {
    preset: "narrow",
    title: "Narrow",
    Icon: ({ className }) => (
      <svg
        className={className}
        width="14"
        height="10"
        viewBox="0 0 14 10"
        fill="currentColor"
      >
        <rect x="0" y="2" width="14" height="6" rx="1" />
      </svg>
    ),
  },
  {
    preset: "medium",
    title: "Medium",
    Icon: ({ className }) => (
      <svg
        className={className}
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="currentColor"
      >
        <rect x="2" y="0" width="10" height="14" rx="2" />
      </svg>
    ),
  },
  {
    preset: "wide",
    title: "Wide",
    Icon: ({ className }) => (
      <svg
        className={className}
        width="18"
        height="12"
        viewBox="0 0 18 12"
        fill="currentColor"
      >
        <rect x="0" y="1" width="18" height="10" rx="2" />
      </svg>
    ),
  },
  {
    preset: "full",
    title: "Full width",
    Icon: ({ className }) => (
      <svg
        className={className}
        width="20"
        height="12"
        viewBox="0 0 20 12"
        fill="currentColor"
      >
        <rect x="0" y="0" width="20" height="12" rx="2" />
      </svg>
    ),
  },
];

export function BlockHoverToolbar({
  blockId,
  currentPreset = "full",
  onWidthChange,
  visible = false,
}: BlockHoverToolbarProps) {
  const editor = useEditorContext();
  if (!editor) return null;

  const handleDelete = () => {
    if (confirm("Delete this block?")) {
      editor.onRemoveBlock(blockId);
    }
  };

  return (
    <div
      className={`${styles.toolbar} ${visible ? styles.toolbarVisible : ""}`}
    >
      <div className={styles.sizeGroup}>
        {WIDTH_PRESETS.map(({ preset, Icon, title }) => (
          <button
            key={preset}
            type="button"
            title={title}
            aria-label={title}
            onClick={() => onWidthChange(preset)}
            className={`${styles.sizeButton} ${
              currentPreset === preset ? styles.active : ""
            }`}
          >
            <Icon className={styles.sizeIcon} />
          </button>
        ))}
      </div>
      <div className={styles.divider} />
      <button
        type="button"
        title="Delete block"
        aria-label="Delete block"
        onClick={handleDelete}
        className={styles.deleteButton}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>
    </div>
  );
}
