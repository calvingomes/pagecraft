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
  activeDragId?: string | null;
}

export function SortableBlock({ block, activeDragId }: SortableBlockProps) {
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

  const hideBecauseOverlay = activeDragId === block.id;

  const widthPreset = block.styles?.widthPreset ?? "small";

  const spansForPreset = (preset: BlockWidthPreset) => {
    switch (preset) {
      case "medium":
        return { w: 2, h: 2 };
      case "wide":
        return { w: 2, h: 1 };
      case "skinnyTall":
        return { w: 2, h: 1 };
      case "tall":
        return { w: 1, h: 2 };
      case "small":
      default:
        return { w: 1, h: 1 };
    }
  };

  const sizePxForPreset = (
    preset: BlockWidthPreset,
  ): { widthPx: number; heightPx: number } => {
    switch (preset) {
      case "medium":
        return { widthPx: 420, heightPx: 420 };
      case "wide":
        return { widthPx: 420, heightPx: 200 };
      case "tall":
        return { widthPx: 200, heightPx: 420 };
      case "skinnyTall":
        return { widthPx: 420, heightPx: 100 };
      case "small":
      default:
        return { widthPx: 200, heightPx: 200 };
    }
  };

  const rectFor = (b: Block, at?: { x: number; y: number }) => {
    const preset = b.styles?.widthPreset ?? "small";
    const { w, h } = spansForPreset(preset);
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

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  const handleWidthChange = (preset: BlockWidthPreset) => {
    if (!editor?.onUpdateBlock) return;

    const currentX = block.layout?.x ?? 0;
    const currentY = block.layout?.y ?? 0;

    // Keep the resized block anchored and push others out of the way.
    const movingSpans = spansForPreset(preset);
    const anchored = {
      x: clamp(currentX, 0, 4 - movingSpans.w),
      y: Math.max(0, currentY),
    };

    type PlacedRect = {
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
    };
    const placed: PlacedRect[] = [
      {
        id: block.id,
        x: anchored.x,
        y: anchored.y,
        w: movingSpans.w,
        h: movingSpans.h,
      },
    ];

    const isFree = (candidate: Omit<PlacedRect, "id">) => {
      if (candidate.x < 0 || candidate.y < 0) return false;
      if (candidate.x + candidate.w > 4) return false;
      return !placed.some((p) => overlaps(candidate, p));
    };

    const findSpotNear = (
      startX: number,
      startY: number,
      w: number,
      h: number,
    ) => {
      const normalizedStartX = clamp(startX, 0, 4 - w);
      const normalizedStartY = Math.max(0, startY);

      const xCandidates = Array.from({ length: 4 - w + 1 }, (_, i) => i).filter(
        (x) => x !== normalizedStartX,
      );
      const orderedXCandidates = [normalizedStartX, ...xCandidates];

      for (let y = normalizedStartY; y < 100; y++) {
        for (const x of orderedXCandidates) {
          const candidate = { x, y, w, h };
          if (isFree(candidate)) return { x, y };
        }
      }

      // Fallback (should rarely happen because rows are effectively unbounded)
      for (let y = 0; y < 100; y++) {
        for (let x = 0; x <= 4 - w; x++) {
          const candidate = { x, y, w, h };
          if (isFree(candidate)) return { x, y };
        }
      }

      return { x: 0, y: 0 };
    };

    // Process blocks in visual order so pushes feel natural.
    const others = allBlocks
      .filter((b) => b.id !== block.id)
      .slice()
      .sort((a, b) => {
        const ay = a.layout?.y ?? 0;
        const by = b.layout?.y ?? 0;
        if (ay !== by) return ay - by;
        const ax = a.layout?.x ?? 0;
        const bx = b.layout?.x ?? 0;
        return ax - bx;
      });

    const moved: Array<{ id: string; layout: { x: number; y: number } }> = [];

    for (const other of others) {
      const otherPreset = other.styles?.widthPreset ?? "small";
      const { w, h } = spansForPreset(otherPreset);
      const originalX = clamp(other.layout?.x ?? 0, 0, 4 - w);
      const originalY = Math.max(0, other.layout?.y ?? 0);
      const originalRect = { x: originalX, y: originalY, w, h };

      const collides = placed.some((p) => overlaps(originalRect, p));
      const finalPos = collides
        ? findSpotNear(originalX, originalY, w, h)
        : { x: originalX, y: originalY };

      placed.push({ id: other.id, x: finalPos.x, y: finalPos.y, w, h });

      if (finalPos.x !== originalX || finalPos.y !== originalY) {
        moved.push({ id: other.id, layout: finalPos });
      }
    }

    editor.onUpdateBlock(block.id, {
      styles: { ...block.styles, widthPreset: preset },
      layout: anchored,
    });

    for (const change of moved) {
      editor.onUpdateBlock(change.id, { layout: change.layout });
    }
  };

  const { widthPx, heightPx } = sizePxForPreset(widthPreset);

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
          ...(hideBecauseOverlay ? {} : dndStyle),
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          maxWidth: "100%",
          maxHeight: "100%",
          opacity: hideBecauseOverlay ? 0 : 1,
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
