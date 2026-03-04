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
import type { Block } from "@/types/editor";
import { SortableBlock } from "@/components/builder/SortableBlock/SortableBlock";
import { useEditorContext } from "@/contexts/EditorContext";
import {
  DESKTOP_GRID,
  clamp,
  rectForBlock,
  sizePxForBlock,
  spansForBlock,
} from "@/lib/blockGrid";
import { useDesktopGridDnd } from "@/components/builder/BlockCanvas/hooks/useDesktopGridDnd";
import { DesktopReadonlyBlock } from "@/components/builder/BlockCanvas/desktop/DesktopReadonlyBlock";
import styles from "../BlockCanvas.module.css";
type DesktopBlockCanvasProps = {
  editable: boolean;
  blocks: Block[];
  onUpdateBlock?: (id: string, updates: Partial<Block>) => void;
};

export const DesktopBlockCanvas = ({
  editable,
  blocks,
  onUpdateBlock,
}: DesktopBlockCanvasProps) => {
  const editor = useEditorContext();
  const applyUpdate = onUpdateBlock ?? (() => undefined);

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
    editable,
    blocks,
    updateBlock: applyUpdate,
    onPersistBlockUpdate: editor?.onUpdateBlock,
  });

  const activeBlock = useMemo(() => {
    if (!activeId) return null;
    return blocks.find((block) => block.id === activeId) ?? null;
  }, [activeId, blocks]);

  const maxBottom = blocks.reduce((acc, block) => {
    const rect = rectForBlock(block);
    return Math.max(acc, rect.y + rect.h);
  }, 0);

  const trailingRows = activeId ? 4 : 1;
  const subRows = Math.max(
    1,
    Math.ceil(maxBottom * DESKTOP_GRID.rowScale) +
      trailingRows * DESKTOP_GRID.rowScale,
  );

  const gridXStridePx = DESKTOP_GRID.cellPx + DESKTOP_GRID.gapXPx;
  const gridYStridePx = DESKTOP_GRID.subRowPx + DESKTOP_GRID.subRowGapPx;

  const placementHighlightStyle = (() => {
    if (!activeBlock || !placementTarget) return null;

    const { widthPx, heightPx } = sizePxForBlock(activeBlock);

    return {
      transform: `translate3d(${placementTarget.x * gridXStridePx}px, ${placementTarget.y * DESKTOP_GRID.rowScale * gridYStridePx}px, 0)`,
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

  const content = (
    <div
      className={styles.canvas}
      style={{
        height: `${subRows * DESKTOP_GRID.subRowPx + (subRows - 1) * DESKTOP_GRID.subRowGapPx}px`,
      }}
    >
      {editable && placementHighlightStyle && (
        <div
          className={styles.placementHighlight}
          style={placementHighlightStyle}
        />
      )}

      {editable && (
        <div
          className={`${styles.dropGrid} ${activeId ? styles.dropGridActive : ""}`}
          style={{
            gridTemplateRows: `repeat(${subRows}, ${DESKTOP_GRID.subRowPx}px)`,
          }}
        >
          {Array.from({ length: subRows }).flatMap((_, y) =>
            Array.from({ length: DESKTOP_GRID.cols }).map((__, x) => (
              <DroppableCell key={`${x}-${y}`} x={x} y={y} />
            )),
          )}
        </div>
      )}

      <div className={styles.grid}>
        {blocks.map((block, index) => {
          const { w: spanW, h: spanH } = spansForBlock(block);
          const xRaw = block.layout?.x ?? index % DESKTOP_GRID.cols;
          const yRaw = block.layout?.y ?? Math.floor(index / DESKTOP_GRID.cols);
          const x = clamp(xRaw, 0, DESKTOP_GRID.cols - spanW);
          const y = Math.max(0, yRaw);
          const dimensions = sizePxForBlock(block);

          return (
            <div
              key={block.id}
              ref={(node) => {
                registerBlockNode(block.id, node);
              }}
              style={{
                gridColumnStart: x + 1,
                gridRowStart: Math.round(y * DESKTOP_GRID.rowScale) + 1,
                gridColumnEnd: `span ${spanW}`,
                gridRowEnd: `span ${Math.max(1, Math.round(spanH * DESKTOP_GRID.rowScale))}`,
              }}
            >
              {editable ? (
                <SortableBlock
                  block={block}
                  dimensions={dimensions}
                  activeDragId={activeId}
                />
              ) : (
                <DesktopReadonlyBlock block={block} dimensions={dimensions} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!editable) return content;

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
