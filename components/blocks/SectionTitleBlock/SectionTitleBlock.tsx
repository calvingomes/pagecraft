"use client";

import { useState, useEffect, useRef } from "react";
import { useEditorContext } from "@/contexts/EditorContext";
import { SectionTitleBlock as SectionTitleBlockType } from "@/types/editor";
import { MOBILE_MAX_WIDTH } from "@/lib/editor-engine/data/viewport";
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

  const isMobileViewport = typeof window !== 'undefined' && window.innerWidth <= MOBILE_MAX_WIDTH;
  const isFocused = editor?.focusedBlockId === block.id;
  const showEditor = !isMobileViewport || isFocused;

  if (!editable || !showEditor) {
    return initialTitle.trim() ? (
      <div className={styles.display}>{initialTitle.trim()}</div>
    ) : (
      editable ? <div className={styles.displayPlaceholder}>Add section title...</div> : null
    );
  }

  return (
    <div className={styles.frame}>
      <input
        type="text"
        name="section-title"
        className={styles.input}
        placeholder="Add section title..."
        value={localTitle}
        autoFocus
        onFocus={() => editor?.onFocusBlock(block.id)}
        onBlur={() => editor?.onFocusBlock(null)}
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
