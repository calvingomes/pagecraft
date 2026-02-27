"use client";

import { useState, useCallback, useEffect } from "react";
import { TextBlock as TextBlockType } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import styles from "./TextBlock.module.css";

export const TextBlock = ({ block }: { block: TextBlockType }) => {
  const editor = useEditorContext();
  const [localText, setLocalText] = useState(block.content?.text ?? "");
  const isEditable = !!editor;

  useEffect(() => {
    setTimeout(() => {
      setLocalText(block.content?.text ?? "");
    }, 0);
  }, [block.content?.text]);

  const onSave = useCallback(() => {
    if (!editor?.onUpdateBlock) return;
    const trimmed = localText.trim();
    editor.onUpdateBlock(block.id, {
      content: { text: trimmed || "New text block" },
    });
  }, [editor, block.id, localText]);

  if (!block?.content?.text && !isEditable) return null;

  if (isEditable) {
    return (
      <div className={styles.textBlock} data-editing>
        <textarea
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={onSave}
          placeholder="Enter text..."
          className={styles.textarea}
          rows={Math.max(2, localText.split("\n").length)}
        />
      </div>
    );
  }

  return (
    <div className={styles.textBlock}>
      <p>{block.content.text}</p>
    </div>
  );
};
