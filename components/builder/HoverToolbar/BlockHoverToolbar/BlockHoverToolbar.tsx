/* eslint-disable css-modules/no-unused-class */
"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Toolbar from "@radix-ui/react-toolbar";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import {
  RectangleVertical,
  RectangleHorizontal,
  Square,
  Minus,
  Search,
  Move,
  Check,
} from "lucide-react";
import { useEditorContext } from "@/contexts/EditorContext";
import styles from "./../HoverToolbar.module.css";
import { BlockBackgroundPalette } from "./../BlockBackgroundPalette/BlockBackgroundPalette";
import { MapSearchPalette } from "@/components/blocks/MapBlock/MapSearchPalette";
import type {
  BlockHoverToolbarProps,
  BlockHoverToolbarIcons,
} from "./BlockHoverToolbar.types";

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
  onMapSearch,
  onMapUnlock,
  isMapUnlocked,
}: BlockHoverToolbarProps) {
  const [isInternalPaletteOpen, setIsInternalPaletteOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [prevVisible, setPrevVisible] = useState(visible);
  const editor = useEditorContext();

  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (!visible) {
      setIsInternalPaletteOpen(false);
      setIsSearchOpen(false);
    }
  }

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

      {blockType === "map" && (
        <>
          <div className={styles.divider} />
          
          <Popover.Root
            open={isSearchOpen}
            onOpenChange={(open) => {
              setIsSearchOpen(open);
              onPaletteOpenChange?.(open);
            }}
          >
            <Popover.Trigger asChild>
              <Toolbar.Button
                type="button"
                title="Search location"
                aria-label="Search location"
                className={`${styles.sizeButton} ${isSearchOpen ? styles.active : ""}`}
                onMouseEnter={() => onPaletteHoverChange?.(true)}
                onMouseLeave={() => onPaletteHoverChange?.(false)}
              >
                <Search size={18} />
              </Toolbar.Button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="top"
                align="center"
                sideOffset={12}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className={styles.popoverContent}
                onMouseEnter={() => onPaletteHoverChange?.(true)}
                onMouseLeave={() => onPaletteHoverChange?.(false)}
              >
                <MapSearchPalette
                  onSelect={(result) => {
                    if (onMapSearch) onMapSearch();
                    // The actual state update happens via SortableBlock -> editor.onUpdateBlock
                    editor.onUpdateBlock(blockId, {
                      content: {
                        address: result.label,
                        lat: result.lat,
                        lng: result.lng,
                        zoom: 12, // Default zoom for new search
                      }
                    });
                    setIsSearchOpen(false);
                    onPaletteHoverChange?.(false); // Explicitly clear hover when selecting
                  }}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <Toolbar.Button
            type="button"
            title={isMapUnlocked ? "Finish adjusting map" : "Adjust map position"}
            aria-label={isMapUnlocked ? "Finish adjusting" : "Adjust position"}
            className={`${styles.sizeButton} ${isMapUnlocked ? styles.active : ""}`}
            onClick={onMapUnlock}
          >
            {isMapUnlocked ? <Check size={18} /> : <Move size={18} />}
          </Toolbar.Button>
        </>
      )}

      {blockType !== "map" && (
        <>
          <div className={styles.divider} />
          <Popover.Root
            open={isInternalPaletteOpen}
            onOpenChange={(open) => {
              setIsInternalPaletteOpen(open);
              onPaletteOpenChange?.(open);
            }}
          >
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
                onMouseEnter={() => onPaletteHoverChange?.(true)}
                onMouseLeave={() => onPaletteHoverChange?.(false)}
              />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="top"
                align="center"
                sideOffset={12}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className={styles.popoverContent}
                onMouseEnter={() => onPaletteHoverChange?.(true)}
                onMouseLeave={() => onPaletteHoverChange?.(false)}
              >
                <BlockBackgroundPalette
                  currentValue={currentBackgroundColor}
                  isTransparent={isTransparentBackground}
                  onChange={onBackgroundColorChange ?? (() => {})}
                  showTransparentOption={blockType === "text"}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </>
      )}
    </Toolbar.Root>
  );
}
