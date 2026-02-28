"use client";

import { useState, type CSSProperties } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Block, BlockWidthPreset } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import { useEditorStore } from "@/stores/editor-store";
import BlockRenderer from "@/components/builder/BlockRenderer/BlockRenderer";
import { BlockHoverToolbar } from "@/components/builder/BlockHoverToolbar/BlockHoverToolbar";
import styles from "./SortableBlock.module.css";

interface SortableBlockProps {
  block: Block;
}

export function SortableBlock({ block }: SortableBlockProps) {
  const editor = useEditorContext();
  const allBlocks = useEditorStore((s) => s.blocks);
  const [isHovered, setIsHovered] = useState(false);

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `block:${block.id}`,
    data: { type: "block", blockId: block.id },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: block.id,
    data: { type: "block", blockId: block.id },
  });

  const dndStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
  };

  const widthPreset = block.styles?.widthPreset ?? "narrow";

  const spanForPreset = (preset: BlockWidthPreset): number => {
    return preset === "medium" ? 2 : 1;
  };

  const sizePxForPreset = (preset: BlockWidthPreset): number => {
    return preset === "medium" ? 300 : 200;
  };

  const rectFor = (b: Block, at?: { x: number; y: number }) => {
    const preset = b.styles?.widthPreset ?? "narrow";
    const w = spanForPreset(preset);
    const h = w;
    const x = at?.x ?? b.layout?.x ?? 0;
    const y = at?.y ?? b.layout?.y ?? 0;
    return { x, y, w, h };
  };

  const overlaps = (
    a: { x: number; y: number; w: number; h: number },
    b: {
      x: number;
      y: number;
      w: number;
      h: number;
    },
  ) => {
    return (
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    );
  };

  const canPlaceAt = (x: number, y: number, preset: BlockWidthPreset) => {
    const moving = {
      x,
      y,
      w: spanForPreset(preset),
      h: spanForPreset(preset),
    };

    if (x < 0 || y < 0) return false;
    if (moving.x + moving.w > 4) return false;

    return !allBlocks.some((other) => {
      if (other.id === block.id) return false;
      return overlaps(moving, rectFor(other));
    });
  };

  const findFirstFreeSpot = (preset: BlockWidthPreset) => {
    const w = spanForPreset(preset);
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x <= 4 - w; x++) {
        if (canPlaceAt(x, y, preset)) return { x, y };
      }
    }
    return { x: 0, y: 0 };
  };

  const handleWidthChange = (preset: BlockWidthPreset) => {
    if (!editor?.onUpdateBlock) return;

    const currentX = block.layout?.x ?? 0;
    const currentY = block.layout?.y ?? 0;
    const target = canPlaceAt(currentX, currentY, preset)
      ? { x: currentX, y: currentY }
      : findFirstFreeSpot(preset);

    editor.onUpdateBlock(block.id, {
      styles: { ...block.styles, widthPreset: preset },
      layout: target,
    });
  };

  const sizePx = sizePxForPreset(widthPreset);

  return (
    <div
      className={styles.hoverZone}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={(node) => {
          setDroppableRef(node);
          setDraggableRef(node);
        }}
        className={`${styles.wrapper} ${isDragging ? styles.dragging : ""}`}
        style={{
          ...dndStyle,
          width: `${sizePx}px`,
          height: `${sizePx}px`,
          maxWidth: "100%",
          maxHeight: "100%",
        }}
        {...attributes}
        {...listeners}
      >
        {editor && (
          <BlockHoverToolbar
            blockId={block.id}
            currentPreset={widthPreset}
            onWidthChange={handleWidthChange}
            visible={isHovered}
          />
        )}
        <div className={styles.content}>
          <div className={styles.blockContent}>
            <BlockRenderer block={block} />
          </div>
        </div>
      </div>
    </div>
  );
}
