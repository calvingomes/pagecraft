"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Toolbar from "@radix-ui/react-toolbar";
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
    preset: "max",
    title: "Max",
    Icon: RectangleHorizontal,
    iconSize: 24,
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
  viewport = "desktop",
}: BlockHoverToolbarProps) {
  const editor = useEditorContext();
  if (!editor) return null;

  const handleDelete = () => {
    editor.onRemoveBlock(blockId);
  };

  const visiblePresets = WIDTH_PRESETS.filter((item) => {
    if (item.preset === "max" && viewport === "mobile") {
      return false;
    }
    if (item.preset === "skinnyWide") {
      return blockType === "text" || blockType === "link";
    }
    if (item.preset === "max") {
      return blockType === "text";
    }
    return true;
  });
  const canToggleWrapperBackground =
    blockType === "text" || blockType === "link";

  return (
    <Toolbar.Root
      className={`${styles.toolbar} ${visible ? styles.toolbarVisible : ""}`}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      aria-label="Block controls"
    >
      <ToggleGroup.Root
        type="single"
        className={styles.sizeGroup}
        value={currentPreset}
        onValueChange={(nextPreset) => {
          if (!nextPreset) return;
          onWidthChange(nextPreset as BlockHoverToolbarIcons["preset"]);
        }}
      >
        {visiblePresets.map(({ preset, Icon, title, iconSize }) => (
          <ToggleGroup.Item
            key={preset}
            value={preset}
            title={title}
            aria-label={title}
            className={`${styles.sizeButton} ${
              currentPreset === preset ? styles.active : ""
            }`}
          >
            <Icon size={iconSize} className={styles.sizeIcon} />
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      {canToggleWrapperBackground && onToggleWrapperBackground && (
        <>
          <div className={styles.divider} />
          <Toolbar.Button
            type="button"
            title="Toggle wrapper background"
            aria-label="Toggle wrapper background"
            onClick={onToggleWrapperBackground}
            className={`${styles.sizeButton} ${
              currentTransparentWrapper ? styles.active : ""
            }`}
          >
            BG
          </Toolbar.Button>
        </>
      )}
      <div className={styles.divider} />
      <Toolbar.Button
        type="button"
        title="Delete block"
        aria-label="Delete block"
        onClick={handleDelete}
        className={styles.deleteButton}
      >
        <Trash2 size={20} className={styles.sizeIcon} />
      </Toolbar.Button>
    </Toolbar.Root>
  );
}
