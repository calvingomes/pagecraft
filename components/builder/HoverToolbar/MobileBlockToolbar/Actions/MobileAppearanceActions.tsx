/* eslint-disable css-modules/no-unused-class */
"use client";

import React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Palette } from "lucide-react";
import { BlockBackgroundPalette } from "../../BlockBackgroundPalette/BlockBackgroundPalette";
import styles from "../MobileBlockToolbar.module.css";
import type { MobileActionProps } from "@/types/builder";

export function MobileAppearanceActions({ block, updateBlock }: MobileActionProps) {
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

  const currentBg = block.mobileStyles?.backgroundColor ?? block.styles?.backgroundColor;

  return (
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
  );
}
