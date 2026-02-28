"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  AlignCenter,
  Trash2,
  RectangleVertical,
  RectangleHorizontal,
  Columns3,
  RectangleEllipsis,
} from "lucide-react";
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
  Icon: LucideIcon;
}[] = [
  {
    preset: "small",
    title: "200×200",
    Icon: AlignLeft,
  },
  {
    preset: "medium",
    title: "420×420",
    Icon: AlignCenter,
  },
  {
    preset: "tall",
    title: "200×420",
    Icon: RectangleVertical,
  },
  {
    preset: "skinnyTall",
    title: "420×100",
    Icon: RectangleEllipsis,
  },
  {
    preset: "wide",
    title: "420×200",
    Icon: RectangleHorizontal,
  },
];

export function BlockHoverToolbar({
  blockId,
  currentPreset = "small",
  onWidthChange,
  visible = false,
}: BlockHoverToolbarProps) {
  const editor = useEditorContext();
  if (!editor) return null;

  const handleDelete = () => {
    editor.onRemoveBlock(blockId);
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
