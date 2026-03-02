"use client";

import { useState, useCallback } from "react";
import { ImageBlock as ImageBlockType } from "@/types/editor";
import Image from "next/image";
import { useEditorContext } from "@/contexts/EditorContext";
import styles from "./ImageBlock.module.css";

export const ImageBlock = ({ block }: { block: ImageBlockType }) => {
  const editor = useEditorContext();
  const [localUrl, setLocalUrl] = useState(block.content?.url ?? "");
  const [localAlt, setLocalAlt] = useState(block.content?.alt ?? "");

  const onSave = useCallback(() => {
    if (!editor?.onUpdateBlock) return;
    editor.onUpdateBlock(block.id, {
      content: { url: localUrl.trim(), alt: localAlt.trim() },
    });
  }, [editor, block.id, localUrl, localAlt]);

  const isEditable = !!editor;

  if (isEditable) {
    return (
      <div className={styles.imageBlock} data-editing>
        <input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={localUrl}
          onChange={(e) => setLocalUrl(e.target.value)}
          onBlur={onSave}
          onKeyDown={(e) => e.key === "Enter" && onSave()}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Alt text (optional)"
          value={localAlt}
          onChange={(e) => setLocalAlt(e.target.value)}
          onBlur={onSave}
          onKeyDown={(e) => e.key === "Enter" && onSave()}
          className={styles.input}
        />
      </div>
    );
  }

  if (!block?.content?.url?.trim()) return null;

  return (
    <div className={styles.imageBlock}>
      <Image
        src={block.content.url}
        alt={block.content.alt ?? ""}
        fill
        sizes="(max-width: 768px) 100vw, 600px"
        style={{ objectFit: "cover" }}
      />
    </div>
  );
};
