"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Trash2,
  CornerDownRight,
} from "lucide-react";
import type { BlockWidthPreset } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import styles from "./BlockHoverToolbar.module.css";

type BlockHoverToolbarProps = {
  blockId: string;
  currentPreset?: BlockWidthPreset;
  onWidthChange: (preset: BlockWidthPreset) => void;
  // when true this block begins a new row (prevents earlier rows from
  // receiving items that come later in sequence)
  rowBreak?: boolean;
  onToggleRowBreak?: () => void;
  visible?: boolean;
};

const WIDTH_PRESETS: {
  preset: BlockWidthPreset;
  title: string;
  Icon: LucideIcon;
}[] = [
  {
    preset: "narrow",
    title: "Narrow",
    Icon: AlignLeft,
  },
  {
    preset: "medium",
    title: "Medium",
    Icon: AlignCenter,
  },
  {
    preset: "wide",
    title: "Wide",
    Icon: AlignRight,
  },
  {
    preset: "full",
    title: "Full width",
    Icon: AlignJustify,
  },
];

export function BlockHoverToolbar({
  blockId,
  currentPreset = "full",
  onWidthChange,
  rowBreak = false,
  onToggleRowBreak,
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
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
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
        {onToggleRowBreak && (
          <button
            type="button"
            title={rowBreak ? "Continue row" : "Start new row"}
            aria-label={rowBreak ? "Continue row" : "Start new row"}
            onClick={onToggleRowBreak}
            className={`${styles.sizeButton} ${rowBreak ? styles.active : ""}`}
          >
            <CornerDownRight className={styles.sizeIcon} />
          </button>
        )}
      </div>
      <div className={styles.divider} />
      <button
        type="button"
        title="Delete block"
        aria-label="Delete block"
        onClick={handleDelete}
        className={styles.deleteButton}
      >
        <Trash2 className={styles.sizeIcon} />
      </button>
    </div>
  );
}
