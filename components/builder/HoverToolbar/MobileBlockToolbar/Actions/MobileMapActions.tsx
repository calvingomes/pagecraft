/* eslint-disable css-modules/no-unused-class */
"use client";

import React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Search } from "lucide-react";
import { MapSearchPalette } from "@/components/blocks/MapBlock/MapSearchPalette";
import styles from "../MobileBlockToolbar.module.css";
import type { MobileActionProps } from "@/types/builder";
import type { MapBlock } from "@/types/editor";

export function MobileMapActions({ block, updateBlock }: MobileActionProps) {
  const mapBlock = block as MapBlock;

  return (
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
                type: "map",
                content: {
                  ...mapBlock.content,
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
  );
}
