/* eslint-disable css-modules/no-unused-class */
"use client";

import * as Toolbar from "@radix-ui/react-toolbar";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { Search, Move, Check } from "lucide-react";
import { MapSearchPalette } from "@/components/blocks/MapBlock/MapSearchPalette";
import { useEditorContext } from "@/contexts/EditorContext";
import styles from "./../HoverToolbar.module.css";

import type { MapActionsProps } from "@/types/builder";

export function MapActions({
  blockId,
  isUnlocked,
  onUnlock,
  onPaletteOpenChange,
  onPaletteHoverChange,
}: MapActionsProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const editor = useEditorContext();

  if (!editor) return null;

  return (
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
            title="Search for a location"
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
                editor.onUpdateBlock(blockId, {
                  content: {
                    address: result.label,
                    lat: result.lat,
                    lng: result.lng,
                    zoom: 12, // Default zoom for selection
                  }
                });
                setIsSearchOpen(false);
                onPaletteHoverChange?.(false);
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <Toolbar.Button
        type="button"
        title={isUnlocked ? "Finish adjusting position" : "Adjust position"}
        aria-label={isUnlocked ? "Finish adjusting" : "Adjust position"}
        className={`${styles.sizeButton} ${isUnlocked ? styles.active : ""}`}
        onClick={onUnlock}
      >
        {isUnlocked ? <Check size={18} /> : <Move size={18} />}
      </Toolbar.Button>
    </>
  );
}
