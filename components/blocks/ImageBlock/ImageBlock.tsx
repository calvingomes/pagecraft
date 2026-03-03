"use client";

import { useState } from "react";
import { ImageBlock as ImageBlockType } from "@/types/editor";
import Image from "next/image";
import { useEditorContext } from "@/contexts/EditorContext";
import styles from "./ImageBlock.module.css";

export const ImageBlock = ({ block }: { block: ImageBlockType }) => {
  const editor = useEditorContext();
  const isEditable = !!editor;
  const [isHovered, setIsHovered] = useState(false);
  const caption = block.content.caption ?? "";
  const hasCaption = caption.trim().length > 0;

  if (!block?.content?.url?.trim()) return null;

  return (
    <div
      className={styles.imageBlock}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={block.content.url}
        loading="lazy"
        alt={block.content.alt ?? ""}
        fill
        sizes="(max-width: 768px) 100vw, 600px"
        style={{ objectFit: "cover" }}
      />

      {isEditable && isHovered ? (
        <div className={styles.captionInputWrap}>
          <input
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
            placeholder="Add caption"
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
