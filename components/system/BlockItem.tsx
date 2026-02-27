"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block } from "@/types/editor";
import { useEditorStore } from "@/stores/editor-store";
import styles from "./BlockItem.module.css";

interface BlockItemProps {
  block: Block;
}

export function BlockItem({ block }: BlockItemProps) {
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const isSelected = selectedBlockId === block.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => selectBlock(block.id)}
      className={`${styles.container} ${isSelected ? styles.selected : ""}`}
    >
      <div className={styles.label}>{block.type.toUpperCase()} BLOCK</div>

      {block.type === "text" && (
        <div className={styles.text}>
          {block.content?.text || "Empty text block"}
        </div>
      )}

      {block.type === "link" && (
        <a href={block.content?.url || "#"} className={styles.link}>
          {block.content?.label || "Link"}
        </a>
      )}

      {block.type === "image" && block.content?.url && (
        <img
          src={block.content.url}
          alt={block.content?.alt || "block"}
          className={styles.image}
        />
      )}
    </div>
  );
}
