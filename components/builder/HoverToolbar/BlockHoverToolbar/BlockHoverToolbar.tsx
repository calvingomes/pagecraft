/* eslint-disable css-modules/no-unused-class */
"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Toolbar from "@radix-ui/react-toolbar";
import * as Popover from "@radix-ui/react-popover";
import {
  RectangleVertical,
  RectangleHorizontal,
  Square,
} from "lucide-react";
import { useEditorContext } from "@/contexts/EditorContext";
import styles from "./../HoverToolbar.module.css";
import { BlockBackgroundPalette } from "./../BlockBackgroundPalette/BlockBackgroundPalette";
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
  blockType,
  currentPreset = "small",
  currentBackgroundColor,
  onWidthChange,
  onBackgroundColorChange,
  onPaletteOpenChange,
  visible = false,
  viewport = "desktop",
}: BlockHoverToolbarProps) {
  const editor = useEditorContext();
  if (!editor) return null;


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
      <div className={styles.divider} />
      <Popover.Root onOpenChange={onPaletteOpenChange}>
        <Popover.Trigger asChild>
          <Toolbar.Button
            type="button"
            title="Update background color"
            aria-label="Update background color"
            className={styles.sizeButton}
            style={{
              backgroundColor: currentBackgroundColor || "var(--color-white)",
              color: "transparent",
            }}
          />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            side="top"
            align="center"
            sideOffset={12}
            onOpenAutoFocus={(e) => e.preventDefault()}
            className={styles.popoverContent}
          >
            <BlockBackgroundPalette
              currentValue={currentBackgroundColor}
              onChange={onBackgroundColorChange ?? (() => {})}
              showTransparentOption={blockType === "text"}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </Toolbar.Root>
  );
}
