"use client";

import React from "react";
import * as Toolbar from "@radix-ui/react-toolbar";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Popover from "@radix-ui/react-popover";
import {
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Trash2,
  Check,
  Palette,
  Type
} from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { BlockBackgroundPalette } from "../BlockBackgroundPalette/BlockBackgroundPalette";
import styles from "./MobileBlockToolbar.module.css";
import type { BlockWidthPreset } from "@/types/editor";

const WIDTH_PRESETS = [
  { preset: "small", Icon: Square, size: 16 },
  { preset: "wide", Icon: RectangleHorizontal, size: 24 },
  { preset: "tall", Icon: RectangleVertical, size: 24 },
  { preset: "large", Icon: Square, size: 24 },
] as const;

export function MobileBlockToolbar() {
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const blocks = useEditorStore((s) => s.blocks);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const focusBlock = useEditorStore((s) => s.focusBlock);

  const block = blocks.find((b) => b.id === selectedBlockId);

  if (!block || !selectedBlockId) return null;

  const handleWidthChange = (preset: BlockWidthPreset) => {
    updateBlock(block.id, {
      mobileStyles: { ...(block.mobileStyles ?? {}), widthPreset: preset },
    });
  };

  const handleBackgroundColorChange = (color: string | null) => {
    if (color === null) {
      updateBlock(block.id, {
        mobileStyles: {
          ...(block.mobileStyles ?? {}),
          transparentWrapper: true,
          backgroundColor: undefined,
        },
      });
    } else {
      updateBlock(block.id, {
        mobileStyles: {
          ...(block.mobileStyles ?? {}),
          transparentWrapper: false,
          backgroundColor: color,
        },
      });
    }
  };

  const currentPreset = block.mobileStyles?.widthPreset ?? block.styles?.widthPreset ?? "small";
  const currentBg = block.mobileStyles?.backgroundColor ?? block.styles?.backgroundColor;

  return (
    <div className={styles.mobileToolbar}>
      <Toolbar.Root className={styles.controlsRow}>
        <ToggleGroup.Root
          type="single"
          className={styles.sizeGroup}
          value={currentPreset}
          onValueChange={(val) => val && handleWidthChange(val as BlockWidthPreset)}
        >
          {WIDTH_PRESETS.map(({ preset, Icon, size }) => (
            <ToggleGroup.Item
              key={preset}
              value={preset}
              className={`${styles.sizeButton} ${currentPreset === preset ? styles.active : ""}`}
            >
              <Icon size={size} />
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>

        <div style={{ display: "flex", gap: "8px" }}>
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className={styles.actionButton}>
                <Palette size={20} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content side="top" align="center" sideOffset={16} className={styles.popoverContent}>
                <BlockBackgroundPalette
                  currentValue={currentBg}
                  onChange={handleBackgroundColorChange}
                  showTransparentOption={block.type === "text"}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {(block.type === "text" || block.type === "link" || block.type === "sectionTitle") && (
            <button
              className={`${styles.actionButton} ${styles.editButton}`}
              onClick={() => focusBlock(block.id)}
            >
              <Type size={20} />
            </button>
          )}

          <button
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={() => {
              removeBlock(block.id);
              selectBlock(null);
            }}
          >
            <Trash2 size={20} />
          </button>

          <button
            className={`${styles.actionButton} ${styles.doneButton}`}
            onClick={() => selectBlock(null)}
          >
            <Check size={20} />
          </button>
        </div>
      </Toolbar.Root>
    </div>
  );
}
