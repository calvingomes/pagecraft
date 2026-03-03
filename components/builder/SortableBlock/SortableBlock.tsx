"use client";

import { useState, type CSSProperties } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { BlockWidthPreset } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import { useEditorStore } from "@/stores/editor-store";
import BlockRenderer from "@/components/builder/BlockRenderer/BlockRenderer";
import { BlockHoverToolbar } from "@/components/builder/BlockHoverToolbar/BlockHoverToolbar";
import styles from "./SortableBlock.module.css";
import { sizePxForBlock } from "@/lib/blockGrid";
import type { SortableBlockProps } from "@/types/builder";
import { computeResizeAndPushUpdates } from "./resizeAndPush";

export function SortableBlock({
  block,
  activeDragId,
  fluid = false,
  dndDisabled = false,
  toolbarAlwaysVisible = false,
}: SortableBlockProps) {
  const editor = useEditorContext();
  const allBlocks = useEditorStore((s) => s.blocks);
  const [isHovered, setIsHovered] = useState(false);

  const toolbarVisible = toolbarAlwaysVisible ? true : isHovered;

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `block:${block.id}`,
    data: { type: "block", blockId: block.id },
    disabled: dndDisabled,
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
    disabled: dndDisabled,
  });

  const dndStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
  };

  const hideBecauseOverlay = activeDragId === block.id;

  const widthPreset = block.styles?.widthPreset ?? "small";
  const showHoverToolbar =
    !!editor && block.type !== "sectionTitle" && block.type !== "paragraph";

  const handleWidthChange = (preset: BlockWidthPreset) => {
    if (!editor?.onUpdateBlock) return;

    const updates = computeResizeAndPushUpdates({
      targetBlock: block,
      allBlocks,
      nextPreset: preset,
    });

    for (const { id, updates: blockUpdates } of updates) {
      editor.onUpdateBlock(id, blockUpdates);
    }
  };

  const { widthPx, heightPx } = sizePxForBlock(block);
  const aspectRatio = `${widthPx} / ${heightPx}`;
  const isParagraph = block.type === "paragraph";

  return (
    <div
      className={styles.hoverZone}
      style={fluid ? { height: "auto" } : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={(node) => {
          setDroppableRef(node);
          setDraggableRef(node);
        }}
        className={styles.frame}
        style={{
          ...(hideBecauseOverlay ? {} : dndStyle),
          maxWidth: "100%",
          maxHeight: "100%",
          opacity: hideBecauseOverlay ? 0 : 1,
        }}
        {...(!dndDisabled ? attributes : {})}
        {...(!dndDisabled ? listeners : {})}
      >
        <div
          className={`${styles.wrapper} ${isDragging ? styles.dragging : ""}`}
          style={
            isParagraph
              ? {
                  width: fluid ? "100%" : `${widthPx}px`,
                  height: `${heightPx}px`,
                }
              : fluid
                ? {
                    width: "100%",
                    height: "auto",
                    aspectRatio,
                  }
                : {
                    width: `${widthPx}px`,
                    height: `${heightPx}px`,
                  }
          }
        >
          <div className={styles.content}>
            <div className={styles.blockContent}>
              <BlockRenderer block={block} />
            </div>
          </div>
        </div>

        {showHoverToolbar && (
          <BlockHoverToolbar
            blockId={block.id}
            blockType={block.type}
            currentPreset={widthPreset}
            onWidthChange={handleWidthChange}
            visible={toolbarVisible}
          />
        )}
      </div>
    </div>
  );
}
