"use client";

import { useState, useCallback } from "react";
import { LinkBlock as LinkBlockType } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import styles from "./LinkBlock.module.css";

export const LinkBlock = ({ block }: { block: LinkBlockType }) => {
  const editor = useEditorContext();
  const [localUrl, setLocalUrl] = useState(block.content?.url ?? "");
  const [localLabel, setLocalLabel] = useState(
    block.content?.label ?? "New link",
  );

  const onSave = useCallback(() => {
    if (!editor?.onUpdateBlock) return;
    editor.onUpdateBlock(block.id, {
      content: { url: localUrl.trim(), label: localLabel.trim() || "Link" },
    });
  }, [editor, block.id, localUrl, localLabel]);

  const isEditable = !!editor;
  const preset = block.styles?.widthPreset ?? "small";
  const clampClass =
    preset === "skinnyTall"
      ? styles.clampSkinnyTall
      : preset === "tall" || preset === "medium"
        ? styles.clampTall
        : styles.clampSmall;

  if (isEditable) {
    return (
      <div className={styles.linkBlock} data-editing>
        <input
          type="url"
          placeholder="https://example.com"
          value={localUrl}
          onChange={(e) => setLocalUrl(e.target.value)}
          onBlur={onSave}
          onKeyDown={(e) => e.key === "Enter" && onSave()}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Link label"
          value={localLabel}
          onChange={(e) => setLocalLabel(e.target.value)}
          onBlur={onSave}
          onKeyDown={(e) => e.key === "Enter" && onSave()}
          className={styles.input}
        />
      </div>
    );
  }

  if (!block?.content?.url?.trim()) return null;

  return (
    <div className={styles.linkBlock}>
      <a
        className={clampClass}
        href={block.content.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {block.content.label}
      </a>
    </div>
  );
};
