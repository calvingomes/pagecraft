"use client";

import { useState, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block, BlockWidthPreset } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import BlockRenderer from "@/components/system/BlockRenderer";
import { BlockHoverToolbar } from "@/components/system/BlockHoverToolbar/BlockHoverToolbar";
import styles from "./SortableBlock.module.css";

interface SortableBlockProps {
  block: Block;
}

const WIDTH_PRESET_MAX: Record<BlockWidthPreset, string> = {
  narrow: "320px",
  medium: "560px",
  wide: "720px",
  full: "100%",
};

export function SortableBlock({ block }: SortableBlockProps) {
  const editor = useEditorContext();
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const widthPreset = block.styles?.widthPreset ?? "full";
  const maxWidth = WIDTH_PRESET_MAX[widthPreset];

  const handleWidthChange = useCallback(
    (preset: BlockWidthPreset) => {
      editor?.onUpdateBlock(block.id, {
        styles: { ...block.styles, widthPreset: preset },
      });
    },
    [editor, block.id, block.styles],
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      className={styles.hoverZone}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={setNodeRef}
        style={style}
        className={`${styles.wrapper} ${isDragging ? styles.dragging : ""}`}
      >
      {editor && (
        <BlockHoverToolbar
          blockId={block.id}
          currentPreset={widthPreset}
          onWidthChange={handleWidthChange}
          visible={isHovered}
        />
      )}
      <div
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <span className={styles.handleIcon}>⋮⋮</span>
      </div>
      <div className={styles.content}>
        <div className={styles.blockContent} style={{ maxWidth }}>
          <BlockRenderer block={block} />
        </div>
      </div>
    </div>
    </div>
  );
}
