"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMemo } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { SortableBlock } from "@/components/builder/SortableBlock/SortableBlock";
import type { Block } from "@/types/editor";
import type { BlockCanvasProps } from "@/types/builder";
import styles from "./BlockCanvas.module.css";
import { useEditorContext } from "@/contexts/EditorContext";
import {
  GRID_CELL_PX,
  GRID_COLS,
  GRID_GAP_PX,
  GRID_ROW_GAP_PX,
  GRID_ROW_PX,
  GRID_ROW_SCALE,
  sizePxForBlock,
  spansForBlock,
  clamp,
  rectForBlock,
} from "@/lib/blockGrid";
import { useIsMobile } from "@/components/builder/BlockCanvas/hooks/useIsMobile";
import { MobileCanvasGrid } from "@/components/builder/BlockCanvas/mobile/MobileCanvasGrid";
import { useDesktopGridDnd } from "@/components/builder/BlockCanvas/hooks/useDesktopGridDnd";
import { DesktopReadonlyBlock } from "@/components/builder/BlockCanvas/desktop/DesktopReadonlyBlock";

export const BlockCanvas = (props: BlockCanvasProps) => {
  const storeBlocks = useEditorStore((s) => s.blocks);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const reorderBlocks = useEditorStore((s) => s.reorderBlocks);
  const editor = useEditorContext();

  const isMobile = useIsMobile(768);

  const blocks = props.editable ? storeBlocks : props.blocks;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const {
    activeId,
    placementTarget,
    registerBlockNode,
    handleDragStart,
    handleDragCancel,
    handleDragOver,
    handleDragEnd,
  } = useDesktopGridDnd({
    editable: props.editable,
    blocks,
    updateBlock,
    onPersistBlockUpdate: editor?.onUpdateBlock,
  });

  const activeBlock = useMemo(() => {
    if (!activeId) return null;
    return blocks.find((b) => b.id === activeId) ?? null;
  }, [activeId, blocks]);

  const maxBottom = blocks.reduce((acc, b) => {
    const r = rectForBlock(b);
    return Math.max(acc, r.y + r.h);
  }, 0);
  // Render occupied rows + trailing empty rows. During a drag, add more rows
  // so the user can pull a block below the current grid extent.
  const TRAILING_ROWS = activeId ? 4 : 1;
  const subRows = Math.max(
    1,
    Math.ceil(maxBottom * GRID_ROW_SCALE) + TRAILING_ROWS * GRID_ROW_SCALE,
  );

  const GRID_X_STRIDE_PX = GRID_CELL_PX + GRID_GAP_PX;
  const GRID_Y_STRIDE_PX = GRID_ROW_PX + GRID_ROW_GAP_PX;

  const placementHighlightStyle = (() => {
    if (!activeBlock) return null;
    if (!placementTarget) return null;

    const { widthPx, heightPx } = sizePxForBlock(activeBlock);

    const xPx = placementTarget.x * GRID_X_STRIDE_PX;
    const yPx = placementTarget.y * GRID_ROW_SCALE * GRID_Y_STRIDE_PX;

    return {
      transform: `translate3d(${xPx}px, ${yPx}px, 0)`,
      width: `${widthPx}px`,
      height: `${heightPx}px`,
    };
  })();

  const DroppableCell = ({ x, y }: { x: number; y: number }) => {
    const { setNodeRef } = useDroppable({
      id: `cell:${x}:${y}`,
      data: { type: "cell", x, y },
    });

    return <div ref={setNodeRef} className={styles.dropCell} />;
  };

  // Mobile mode: 2-column responsive grid. In the editor, we support reorder-only.
  if (isMobile) {
    if (props.editable) {
      return (
        <MobileCanvasGrid
          editable
          blocks={blocks}
          onReorder={(active, over) => reorderBlocks(active, over)}
        />
      );
    }

    return <MobileCanvasGrid editable={false} blocks={blocks} />;
  }

  const content = (
    <div
      className={styles.canvas}
      style={{
        height: `${subRows * GRID_ROW_PX + (subRows - 1) * GRID_ROW_GAP_PX}px`,
      }}
    >
      {props.editable && placementHighlightStyle && (
        <div
          className={styles.placementHighlight}
          style={placementHighlightStyle}
        />
      )}
      {props.editable && (
        <div
          className={`${styles.dropGrid} ${activeId ? styles.dropGridActive : ""}`}
          style={{
            gridTemplateRows: `repeat(${subRows}, ${GRID_ROW_PX}px)`,
          }}
        >
          {Array.from({ length: subRows }).flatMap((_, y) =>
            Array.from({ length: GRID_COLS }).map((__, x) => (
              <DroppableCell key={`${x}-${y}`} x={x} y={y} />
            )),
          )}
        </div>
      )}
      <div className={styles.grid}>
        {blocks.map((block: Block, index: number) => {
          const { w: spanW, h: spanH } = spansForBlock(block);
          const xRaw = block.layout?.x ?? index % GRID_COLS;
          const yRaw = block.layout?.y ?? Math.floor(index / GRID_COLS);
          const x = clamp(xRaw, 0, GRID_COLS - spanW);
          const y = Math.max(0, yRaw);
          return (
            <div
              key={block.id}
              ref={(node) => {
                registerBlockNode(block.id, node);
              }}
              style={{
                gridColumnStart: x + 1,
                gridRowStart: Math.round(y * GRID_ROW_SCALE) + 1,
                gridColumnEnd: `span ${spanW}`,
                gridRowEnd: `span ${Math.max(1, Math.round(spanH * GRID_ROW_SCALE))}`,
              }}
            >
              {props.editable ? (
                <SortableBlock block={block} activeDragId={activeId} />
              ) : (
                <DesktopReadonlyBlock block={block} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!props.editable) return content;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {content}
    </DndContext>
  );
};
