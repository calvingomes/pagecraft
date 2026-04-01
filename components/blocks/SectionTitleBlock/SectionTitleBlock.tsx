"use client";

import { useState, useEffect, useRef } from "react";
import { useEditorContext } from "@/contexts/EditorContext";
import { SectionTitleBlock as SectionTitleBlockType } from "@/types/editor";
import styles from "./SectionTitleBlock.module.css";

export const SectionTitleBlock = ({
  block,
}: {
  block: SectionTitleBlockType;
}) => {
  const editor = useEditorContext();
  const editable = !!editor;
  const initialTitle = block.content.title ?? "";

  const [localTitle, setLocalTitle] = useState(initialTitle);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local if external changes
  useEffect(() => {
    setLocalTitle(initialTitle);
  }, [initialTitle]);

  if (!editable) {
    return initialTitle.trim() ? (
      <div className={styles.display}>{initialTitle.trim()}</div>
    ) : null;
  }

  return (
    <div className={styles.frame}>
      <input
        type="text"
        name="section-title"
        className={styles.input}
        placeholder="Add section title..."
        value={localTitle}
        onChange={(event) => {
          const next = event.target.value;
          setLocalTitle(next);

          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }

          debounceTimerRef.current = setTimeout(() => {
            editor.onUpdateBlock(block.id, {
              content: { title: next },
            });
          }, 500);
        }}
      />
    </div>
  );
};
