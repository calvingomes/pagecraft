"use client";

import { useState, useEffect, useRef } from "react";
import { TextBlock as TextBlockType } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import styles from "./TextBlock.module.css";

export const TextBlock = ({ block }: { block: TextBlockType }) => {
  const editor = useEditorContext();
  const editable = !!editor;

  const [text, setText] = useState(block.content?.text ?? "");

  const lastSyncedText = useRef(block.content?.text ?? "");

  useEffect(() => {
    if (block.content?.text !== lastSyncedText.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(block.content?.text ?? "");
      lastSyncedText.current = block.content?.text ?? "";
    }
  }, [block.id, block.content?.text]);

  const handleBlur = () => {
    if (!editor?.onUpdateBlock) return;

    const trimmed = text.trim();
    const finalContent = trimmed || "New text block";

    if (finalContent !== block.content?.text) {
      lastSyncedText.current = finalContent;
      editor.onUpdateBlock(block.id, {
        content: { text: finalContent },
      });
    }
  };

  if (editable) {
    return (
      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder="Enter text..."
        rows={Math.max(2, text.split("\n").length)}
      />
    );
  }

  return text ? <p className={styles.display}>{text}</p> : null;
};
