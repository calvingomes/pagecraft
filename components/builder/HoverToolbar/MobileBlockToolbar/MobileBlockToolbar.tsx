/* eslint-disable css-modules/no-unused-class */
"use client";

import React from "react";
import * as Toolbar from "@radix-ui/react-toolbar";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Popover from "@radix-ui/react-popover";
import {
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Check,
  Minus
} from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import styles from "./MobileBlockToolbar.module.css";
import { MobileActionRegistry } from "./MobileActionRegistry";
import type { BlockWidthPreset } from "@/types/editor";

const WIDTH_PRESETS = [
  { preset: "small", Icon: Square, size: 16, title: "Small (1x1)" },
  { preset: "skinnyWide", Icon: Minus, size: 24, title: "Skinny Wide (2x0.5)" },
  { preset: "wide", Icon: RectangleHorizontal, size: 24, title: "Wide (2x1)" },
  { preset: "tall", Icon: RectangleVertical, size: 24, title: "Tall (1x2)" },
  { preset: "large", Icon: Square, size: 24, title: "Large (2x2)" },
] as const;

export function MobileBlockToolbar() {
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const blocks = useEditorStore((s) => s.blocks);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const [isSizePopoverOpen, setIsSizePopoverOpen] = React.useState(false);

  const block = blocks.find((b) => b.id === selectedBlockId);

  if (!block || !selectedBlockId) return null;

  const handleWidthChange = (preset: BlockWidthPreset) => {
    updateBlock(block.id, {
      mobileStyles: { ...(block.mobileStyles ?? {}), widthPreset: preset },
    });
  };

  const currentPreset = block.mobileStyles?.widthPreset ?? block.styles?.widthPreset ?? "small";

  // Filter presets based on block type
  const visiblePresets = WIDTH_PRESETS.filter((p) => {
    if (p.preset === "skinnyWide") {
      return block.type === "text" || block.type === "link";
    }
    return true;
  });

  // Resolve block-specific actions from the registry
  const ActionComponent = MobileActionRegistry[block.type];

  return (
    <div className={styles.mobileToolbar}>
      <Toolbar.Root className={styles.controlsRow}>
        <div className={styles.leftActions}>
          <Popover.Root open={isSizePopoverOpen} onOpenChange={setIsSizePopoverOpen}>
            <Popover.Trigger asChild>
              <button className={`${styles.actionButton} ${styles.sizeTrigger}`}>
                {(() => {
                  const p = WIDTH_PRESETS.find((p) => p.preset === currentPreset) || WIDTH_PRESETS[0];
                  return React.createElement(p.Icon, { size: p.size });
                })()}
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content side="top" align="start" sideOffset={24} className={styles.sizePopoverContent}>
                <ToggleGroup.Root
                  type="single"
                  className={styles.sizeGroup}
                  value={currentPreset}
                  onValueChange={(val) => {
                    if (val) {
                      handleWidthChange(val as BlockWidthPreset);
                      setIsSizePopoverOpen(false);
                    }
                  }}
                >
                  {visiblePresets.map(({ preset, Icon, size, title }) => (
                    <ToggleGroup.Item
                      key={preset}
                      value={preset}
                      title={title}
                      aria-label={title}
                      className={`${styles.sizeButton} ${currentPreset === preset ? styles.active : ""}`}
                    >
                      <Icon size={size} />
                    </ToggleGroup.Item>
                  ))}
                </ToggleGroup.Root>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {/* Plugin-based Action Component */}
          {ActionComponent && (
            <ActionComponent 
              block={block} 
              updateBlock={updateBlock} 
            />
          )}
        </div>

        <div className={styles.rightActions}>
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
