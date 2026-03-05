"use client";

import { useState, type CSSProperties } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { BlockWidthPreset } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import {
  selectActiveViewportBlocks,
  useEditorStore,
} from "@/stores/editor-store";
import BlockRenderer from "@/components/builder/BlockRenderer/BlockRenderer";
import { BlockHoverToolbar } from "@/components/builder/BlockHoverToolbar/BlockHoverToolbar";
import styles from "./SortableBlock.module.css";
import { shouldUseTransparentWrapper } from "@/lib/blockWrapper";
import type { SortableBlockProps } from "@/types/builder";
import { computeResizeAndPushUpdates } from "@/lib/editor-engine/layout/resize";

export function SortableBlock({
  block,
  dimensions,
  activeDragId,
  fluid = false,
  dndDisabled = false,
  gridConfig,
}: SortableBlockProps) {
  const editor = useEditorContext();
  const allBlocks = useEditorStore(selectActiveViewportBlocks);
  const [isHovered, setIsHovered] = useState(false);

  const toolbarVisible = isHovered;

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
  const showHoverToolbar = !!editor && block.type !== "sectionTitle";
  const isTransparentWrapper = shouldUseTransparentWrapper(block, "edit");
  const viewport = gridConfig?.cols === 2 ? "mobile" : "desktop";

  const handleWidthChange = (preset: BlockWidthPreset) => {
    if (!editor?.onUpdateBlock) return;

    const updates = computeResizeAndPushUpdates({
      targetBlock: block,
      allBlocks,
      nextPreset: preset,
      gridConfig,
    });

    for (const { id, updates: blockUpdates } of updates) {
      editor.onUpdateBlock(id, blockUpdates);
    }
  };

  const handleToggleWrapperBackground = () => {
    if (!editor?.onUpdateBlock) return;
    const canToggleBackground = block.type === "text" || block.type === "link";
    if (!canToggleBackground) return;

    editor.onUpdateBlock(block.id, {
      styles: {
        ...block.styles,
        transparentWrapper: !isTransparentWrapper,
      },
    });
  };

  const { widthPx, heightPx } = dimensions;
  const aspectRatio = `${widthPx} / ${heightPx}`;

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
          ...(fluid ? { width: "100%" } : {}),
          maxWidth: "100%",
          maxHeight: "100%",
          opacity: hideBecauseOverlay ? 0 : 1,
        }}
        {...(!dndDisabled ? attributes : {})}
        {...(!dndDisabled ? listeners : {})}
      >
        <div
          className={`${styles.wrapper} ${isTransparentWrapper ? styles.emptyWrapper : ""} ${isDragging ? styles.dragging : ""}`}
          style={
            fluid
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
            currentTransparentWrapper={isTransparentWrapper}
            onWidthChange={handleWidthChange}
            onToggleWrapperBackground={handleToggleWrapperBackground}
            visible={toolbarVisible}
            viewport={viewport}
          />
        )}
      </div>
    </div>
  );
}
