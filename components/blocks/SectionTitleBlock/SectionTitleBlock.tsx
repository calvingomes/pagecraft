"use client";

import { Trash2 } from "lucide-react";
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
  const title = block.content.title ?? "";

  if (!editable) {
    return title.trim() ? (
      <div className={styles.display}>{title.trim()}</div>
    ) : null;
  }

  return (
    <div className={styles.frame}>
      <input
        type="text"
        className={styles.input}
        placeholder="Add section title"
        value={title}
        onChange={(event) => {
          editor.onUpdateBlock(block.id, {
            content: { title: event.target.value },
          });
        }}
      />
      <button
        type="button"
        aria-label="Delete section title"
        title="Delete section title"
        className={styles.deleteButton}
        onClick={() => {
          editor.onRemoveBlock(block.id);
        }}
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};
