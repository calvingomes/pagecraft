/* eslint-disable css-modules/no-unused-class */
"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Toolbar from "@radix-ui/react-toolbar";
import { useState } from "react";
import {
  RectangleVertical,
  RectangleHorizontal,
  Square,
  Minus,
} from "lucide-react";
import { useEditorContext } from "@/contexts/EditorContext";
import styles from "./../HoverToolbar.module.css";
import { ActionRegistry } from "../BlockActions/ActionRegistry";
import type {
  BlockHoverToolbarProps,
  BlockHoverToolbarIcons,
} from "@/types/builder";

const WIDTH_PRESETS: BlockHoverToolbarIcons[] = [
  {
    preset: "small",
    title: "Small (1x1)",
    Icon: Square,
    iconSize: 12,
  },
  {
    preset: "skinnyWide",
    title: "Skinny Wide (2x0.5)",
    Icon: Minus,
    iconSize: 20,
  },
  {
    preset: "wide",
    title: "Wide (2x1)",
    Icon: RectangleHorizontal,
    iconSize: 20,
  },
  {
    preset: "tall",
    title: "Tall (1x2)",
    Icon: RectangleVertical,
    iconSize: 20,
  },
  {
    preset: "large",
    title: "Large (2x2)",
    Icon: Square,
    iconSize: 24,
  },
  {
    preset: "max",
    title: "Full Width",
    Icon: RectangleHorizontal,
    iconSize: 24,
  },
];

export function BlockHoverToolbar({
  blockId,
  blockType,
  currentPreset = "small",
  currentBackgroundColor,
  isTransparentBackground = false,
  onWidthChange,
  onBackgroundColorChange,
  onPaletteOpenChange,
  onPaletteHoverChange,
  visible = false,
  viewport = "desktop",
  onUnlock,
  isUnlocked = false,
}: BlockHoverToolbarProps) {
  const [prevVisible, setPrevVisible] = useState(visible);
  const editor = useEditorContext();

  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (!visible) {
      onPaletteOpenChange?.(false);
    }
  }

  if (!editor) return null;

  const visiblePresets = WIDTH_PRESETS.filter((item) => {
    if (item.preset === "max" && viewport === "mobile") return false;
    if (item.preset === "skinnyWide") return blockType === "text" || blockType === "link";
    if (item.preset === "max") return blockType === "text";
    return true;
  });

  // Resolve block-specific actions from the registry
  const ActionComponent = ActionRegistry[blockType];

  return (
    <Toolbar.Root
      className={`${styles.toolbar} ${visible ? styles.toolbarVisible : ""}`}
      onPointerDown={(e) => e.stopPropagation()}
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

      {/* Modular Block Actions Plugin */}
      {ActionComponent && (
        <ActionComponent
          blockId={blockId}
          blockType={blockType}
          currentBackgroundColor={currentBackgroundColor}
          isTransparentBackground={isTransparentBackground}
          onBackgroundColorChange={onBackgroundColorChange}
          onPaletteOpenChange={onPaletteOpenChange}
          onPaletteHoverChange={onPaletteHoverChange}
          isUnlocked={isUnlocked}
          onUnlock={onUnlock}
        />
      )}
    </Toolbar.Root>
  );
}
