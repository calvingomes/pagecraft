"use client";

import {
  Trash2,
  RectangleVertical,
  RectangleHorizontal,
  Square,
} from "lucide-react";
import { useEditorContext } from "@/contexts/EditorContext";
import styles from "./BlockHoverToolbar.module.css";
import type {
  BlockHoverToolbarProps,
  BlockHoverToolbarIcons,
} from "./BlockHoverToolbar.types";

const WIDTH_PRESETS: BlockHoverToolbarIcons[] = [
  {
    preset: "small",
    title: "Small",
    Icon: Square,
    iconSize: 12,
  },
  {
    preset: "wide",
    title: "Wide",
    Icon: RectangleHorizontal,
    iconSize: 20,
  },
  {
    preset: "skinnyWide",
    title: "Skinny Wide",
    Icon: RectangleHorizontal,
    iconSize: 16,
  },
  {
    preset: "tall",
    title: "Tall",
    Icon: RectangleVertical,
    iconSize: 20,
  },
  {
    preset: "large",
    title: "Large",
    Icon: Square,
    iconSize: 24,
  },
];

export function BlockHoverToolbar({
  blockId,
  blockType,
  currentPreset = "small",
  currentTransparentWrapper = false,
  onWidthChange,
  onToggleWrapperBackground,
  visible = false,
}: BlockHoverToolbarProps) {
  const editor = useEditorContext();
  if (!editor) return null;

  const handleDelete = () => {
    editor.onRemoveBlock(blockId);
  };

  const visiblePresets = WIDTH_PRESETS.filter((item) => {
    if (item.preset !== "skinnyWide") return true;
    return blockType === "text" || blockType === "link";
  });
  const canToggleWrapperBackground =
    blockType === "text" || blockType === "link";

  return (
    <div
      className={`${styles.toolbar} ${visible ? styles.toolbarVisible : ""}`}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className={styles.sizeGroup}>
        {visiblePresets.map(({ preset, Icon, title, iconSize }) => (
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
            <Icon size={iconSize} className={styles.sizeIcon} />
          </button>
        ))}
      </div>
      {canToggleWrapperBackground && onToggleWrapperBackground && (
        <>
          <div className={styles.divider} />
          <button
            type="button"
            title="Toggle wrapper background"
            aria-label="Toggle wrapper background"
            onClick={onToggleWrapperBackground}
            className={`${styles.sizeButton} ${
              currentTransparentWrapper ? styles.active : ""
            }`}
          >
            BG
          </button>
        </>
      )}
      <div className={styles.divider} />
      <button
        type="button"
        title="Delete block"
        aria-label="Delete block"
        onClick={handleDelete}
        className={styles.deleteButton}
      >
        <Trash2 size={20} className={styles.sizeIcon} />
      </button>
    </div>
  );
}
