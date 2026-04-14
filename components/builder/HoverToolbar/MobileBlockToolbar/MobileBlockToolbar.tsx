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
  Palette,
  Type,
  Link2,
  Minus,
  Search
} from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { BlockBackgroundPalette } from "../BlockBackgroundPalette/BlockBackgroundPalette";
import { MapSearchPalette } from "@/components/blocks/MapBlock/MapSearchPalette";
import { normalizeLinkUrl } from "@/lib/utils/linkBlock";
import * as Label from "@radix-ui/react-label";
import styles from "./MobileBlockToolbar.module.css";
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
  const [isCaptionPopoverOpen, setIsCaptionPopoverOpen] = React.useState(false);
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = React.useState(false);
  const [isSizePopoverOpen, setIsSizePopoverOpen] = React.useState(false);

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

  // Filter presets based on block type
  const visiblePresets = WIDTH_PRESETS.filter((p) => {
    if (p.preset === "skinnyWide") {
      return block.type === "text" || block.type === "link";
    }
    return true;
  });

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

          <Popover.Root>
            <Popover.Trigger asChild>
              <button className={styles.actionButton}>
                <Palette size={20} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="top"
                align="center"
                sideOffset={24}
                className={styles.popoverContent}
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <BlockBackgroundPalette
                  currentValue={currentBg}
                  onChange={handleBackgroundColorChange}
                  showTransparentOption={block.type === "text"}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {/* Block-Specific Tools */}
          {block.type === "map" && (
            <Popover.Root>
              <Popover.Trigger asChild>
                <button className={styles.actionButton}>
                  <Search size={20} />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  side="top"
                  align="center"
                  sideOffset={24}
                  className={styles.popoverContent}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <MapSearchPalette
                    onSelect={(result) => {
                      updateBlock(block.id, {
                        content: {
                          ...block.content,
                          address: result.label,
                          lat: result.lat,
                          lng: result.lng,
                          zoom: 12,
                        }
                      });
                    }}
                  />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          )}

          {block.type === "image" && (
            <>
              <Popover.Root open={isCaptionPopoverOpen} onOpenChange={setIsCaptionPopoverOpen}>
                <Popover.Trigger asChild>
                  <button className={`${styles.actionButton} ${block.content.caption ? styles.hasValue : ""}`}>
                    <Type size={20} />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    side="top"
                    align="center"
                    sideOffset={24}
                    className={styles.popoverContent}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <div className={styles.inputWrapper}>
                      <Label.Root className={styles.inputLabel}>Caption</Label.Root>
                      <input
                        type="text"
                        placeholder="Add caption..."
                        className={styles.popoverInput}
                        value={block.content.caption ?? ""}
                        onChange={(e) => {
                          updateBlock(block.id, {
                            content: { ...block.content, caption: e.target.value }
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setIsCaptionPopoverOpen(false);
                        }}
                      />
                    </div>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>

              <Popover.Root open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
                <Popover.Trigger asChild>
                  <button className={`${styles.actionButton} ${block.content.linkUrl ? styles.hasValue : ""}`}>
                    <Link2 size={20} />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    side="top"
                    align="center"
                    sideOffset={24}
                    className={styles.popoverContent}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <div className={styles.inputWrapper}>
                      <Label.Root className={styles.inputLabel}>Link URL</Label.Root>
                      <input
                        type="text"
                        placeholder="Paste or type a link..."
                        className={styles.popoverInput}
                        value={block.content.linkUrl ?? ""}
                        onChange={(e) => {
                          updateBlock(block.id, {
                            content: { ...block.content, linkUrl: e.target.value }
                          });
                        }}
                        onBlur={() => {
                          if (!block.content.linkUrl?.trim()) return;
                          updateBlock(block.id, {
                            content: { ...block.content, linkUrl: normalizeLinkUrl(block.content.linkUrl) }
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (block.content.linkUrl?.trim()) {
                              updateBlock(block.id, {
                                content: { ...block.content, linkUrl: normalizeLinkUrl(block.content.linkUrl) }
                              });
                            }
                            setIsLinkPopoverOpen(false);
                          }
                        }}
                      />
                    </div>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </>
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
