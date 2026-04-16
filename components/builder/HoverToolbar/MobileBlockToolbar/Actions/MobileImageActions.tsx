/* eslint-disable css-modules/no-unused-class */
"use client";

import React from "react";
import * as Popover from "@radix-ui/react-popover";
import * as Label from "@radix-ui/react-label";
import { Type, Link2 } from "lucide-react";
import { normalizeLinkUrl } from "@/lib/utils/linkBlock";
import styles from "../MobileBlockToolbar.module.css";
import type { MobileActionProps } from "@/types/builder";
import type { ImageBlock } from "@/types/editor";

export function MobileImageActions({ block, updateBlock }: MobileActionProps) {
  const imageBlock = block as ImageBlock;
  const [isCaptionPopoverOpen, setIsCaptionPopoverOpen] = React.useState(false);
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = React.useState(false);

  return (
    <>
      <Popover.Root open={isCaptionPopoverOpen} onOpenChange={setIsCaptionPopoverOpen}>
        <Popover.Trigger asChild>
          <button className={`${styles.actionButton} ${imageBlock.content.caption ? styles.hasValue : ""}`}>
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
                value={imageBlock.content.caption ?? ""}
                onChange={(e) => {
                  updateBlock(block.id, {
                    type: "image",
                    content: { ...imageBlock.content, caption: e.target.value }
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
          <button className={`${styles.actionButton} ${imageBlock.content.linkUrl ? styles.hasValue : ""}`}>
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
                value={imageBlock.content.linkUrl ?? ""}
                onChange={(e) => {
                  updateBlock(block.id, {
                    type: "image",
                    content: { ...imageBlock.content, linkUrl: e.target.value }
                  });
                }}
                onBlur={() => {
                  if (!imageBlock.content.linkUrl?.trim()) return;
                  updateBlock(block.id, {
                    type: "image",
                    content: { ...imageBlock.content, linkUrl: normalizeLinkUrl(imageBlock.content.linkUrl) }
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (imageBlock.content.linkUrl?.trim()) {
                      updateBlock(block.id, {
                        type: "image",
                        content: { ...imageBlock.content, linkUrl: normalizeLinkUrl(imageBlock.content.linkUrl) }
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
  );
}
