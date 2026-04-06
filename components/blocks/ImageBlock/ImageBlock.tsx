"use client";
/* eslint-disable css-modules/no-unused-class */

import * as Label from "@radix-ui/react-label";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { Link2, ArrowUpRight, Type } from "lucide-react";
import { ImageBlock as ImageBlockType } from "@/types/editor";
import Image from "next/image";
import { useEditorContext } from "@/contexts/EditorContext";
import { getCacheBustedUrl } from "@/lib/utils/imageUtils";
import { normalizeLinkUrl } from "@/lib/utils/linkBlock";
import { ImageZoom } from "./ImageZoom";
import styles from "./ImageBlock.module.css";

export const ImageBlock = ({ block }: { block: ImageBlockType }) => {
  const editor = useEditorContext();
  const isEditable = !!editor;
  const [isHovered, setIsHovered] = useState(false);
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [isCaptionPopoverOpen, setIsCaptionPopoverOpen] = useState(false);

  const captionInputId = `image-caption-${block.id}`;
  const caption = block.content.caption ?? "";
  const linkUrl = block.content.linkUrl ?? "";
  const hasCaption = caption.trim().length > 0;

  if (!block?.content?.url?.trim()) return null;

  const imageUrl = getCacheBustedUrl(block.content.url, block.updated_at);
  const hasLink = !isEditable && linkUrl.trim().length > 0;

  const ImageElement = (
    <Image
      src={imageUrl}
      loading="lazy"
      alt={block.content.alt ?? ""}
      fill
      sizes="(max-width: 768px) 100vw, 600px"
      style={{ objectFit: "cover" }}
    />
  );

  return (
    <div
      className={styles.imageBlock}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsLinkPopoverOpen(false);
        setIsCaptionPopoverOpen(false);
      }}
    >
      {hasLink ? (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.imageBlockLink}
        >
          {ImageElement}
        </a>
      ) : (
        ImageElement
      )}

      {hasLink && (
        <div className={styles.externalLinkIndicator}>
          <ArrowUpRight size={18} />
        </div>
      )}

      <ImageZoom
        url={imageUrl}
        alt={block.content.alt}
        showTrigger={isHovered}
        isEditable={isEditable}
        onOpenChange={(open) => {
          if (open) setIsHovered(false);
        }}
      />

      {isEditable && isHovered && !editor?.isActualMobile ? (
        <div className={styles.editorControls}>
          <Popover.Root open={isCaptionPopoverOpen} onOpenChange={setIsCaptionPopoverOpen}>
            <Popover.Trigger asChild>
              <button
                className={`${styles.controlTrigger} ${caption ? styles.controlTriggerHasValue : ""}`}
                title="Add caption"
                onClick={(e) => e.stopPropagation()}
              >
                <Type size={16} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className={styles.popoverContent}
                side="bottom"
                align="end"
                sideOffset={8}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <Label.Root className={styles.popoverLabel} htmlFor={captionInputId}>
                  Caption
                </Label.Root>
                <input
                  id={captionInputId}
                  type="text"
                  placeholder="Add caption..."
                  className={styles.popoverInput}
                  value={caption}
                  autoFocus
                  onChange={(event) => {
                    if (!editor?.onUpdateBlock) return;
                    editor.onUpdateBlock(block.id, {
                      content: {
                        ...block.content,
                        caption: event.target.value,
                      },
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsCaptionPopoverOpen(false);
                    }
                  }}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <Popover.Root open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
            <Popover.Trigger asChild>
              <button
                className={`${styles.controlTrigger} ${linkUrl ? styles.controlTriggerHasValue : ""}`}
                title="Add link"
                onClick={(e) => e.stopPropagation()}
              >
                <Link2 size={16} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className={styles.popoverContent}
                side="bottom"
                align="end"
                sideOffset={8}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <Label.Root className={styles.popoverLabel}>
                  Link
                </Label.Root>
                <input
                  type="text"
                  placeholder="Paste or type a link..."
                  className={styles.popoverInput}
                  value={linkUrl}
                  autoFocus
                  onChange={(e) => {
                    if (!editor?.onUpdateBlock) return;
                    editor.onUpdateBlock(block.id, {
                      content: {
                        ...block.content,
                        linkUrl: e.target.value,
                      },
                    });
                  }}
                  onBlur={() => {
                    if (!editor?.onUpdateBlock || !linkUrl.trim()) return;
                    editor.onUpdateBlock(block.id, {
                      content: {
                        ...block.content,
                        linkUrl: normalizeLinkUrl(linkUrl),
                      },
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!editor?.onUpdateBlock) return;
                      editor.onUpdateBlock(block.id, {
                        content: {
                          ...block.content,
                          linkUrl: normalizeLinkUrl(linkUrl),
                        },
                      });
                      setIsLinkPopoverOpen(false);
                    }
                  }}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      ) : null}

      {hasCaption ? (
        <div className={styles.captionOverlay}>
          <span className={styles.captionText}>{caption.trim()}</span>
        </div>
      ) : null}
    </div>
  );
};
