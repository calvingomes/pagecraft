/* eslint-disable css-modules/no-unused-class */
"use client";

import * as Toolbar from "@radix-ui/react-toolbar";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { BlockBackgroundPalette } from "./../BlockBackgroundPalette/BlockBackgroundPalette";
import styles from "./../HoverToolbar.module.css";
import type { AppearanceActionsProps } from "@/types/builder";

export function AppearanceActions({
  blockType,
  currentBackgroundColor,
  isTransparentBackground,
  onBackgroundColorChange,
  onPaletteOpenChange,
  onPaletteHoverChange,
}: AppearanceActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={styles.divider} />
      <Popover.Root
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
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
              onChange={onBackgroundColorChange}
              showTransparentOption={blockType === "text"}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}
