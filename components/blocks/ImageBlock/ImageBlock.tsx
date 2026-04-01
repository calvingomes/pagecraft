"use client";

import * as Label from "@radix-ui/react-label";
import { useState } from "react";
import { ImageBlock as ImageBlockType } from "@/types/editor";
import Image from "next/image";
import { useEditorContext } from "@/contexts/EditorContext";
import { VISUALLY_HIDDEN_STYLE } from "@/lib/utils/visuallyHidden";
import { getCacheBustedUrl } from "@/lib/utils/imageUtils";
import styles from "./ImageBlock.module.css";

export const ImageBlock = ({ block }: { block: ImageBlockType }) => {
  const editor = useEditorContext();
  const isEditable = !!editor;
  const [isHovered, setIsHovered] = useState(false);
  const captionInputId = `image-caption-${block.id}`;
  const caption = block.content.caption ?? "";
  const hasCaption = caption.trim().length > 0;

  if (!block?.content?.url?.trim()) return null;

  const imageUrl = getCacheBustedUrl(block.content.url, block.updated_at);

  return (
    <div
      className={styles.imageBlock}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={imageUrl}
        loading="lazy"
        alt={block.content.alt ?? ""}
        fill
        sizes="(max-width: 768px) 100vw, 600px"
        style={{ objectFit: "cover" }}
      />

      {isEditable && isHovered ? (
        <div className={styles.captionInputWrap}>
          <Label.Root htmlFor={captionInputId} style={VISUALLY_HIDDEN_STYLE}>
            Image caption
          </Label.Root>
          <input
            id={captionInputId}
            type="text"
            value={caption}
            onChange={(event) => {
              if (!editor?.onUpdateBlock) return;
              editor.onUpdateBlock(block.id, {
                content: {
                  ...block.content,
                  caption: event.target.value,
                },
              });
            }}
            placeholder="Add caption..."
            className={styles.captionInput}
          />
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
