"use client";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMemo } from "react";
import type { Block } from "@/types/editor";
import { SortableBlock } from "@/components/builder/SortableBlock/SortableBlock";
import { useEditorContext } from "@/contexts/EditorContext";
import {
  MOBILE_GRID,
  clamp,
  rectForBlock,
  sizePxForBlock,
  spansForBlock,
} from "@/lib/blockGrid";
import { useGridDnd } from "@/components/builder/BlockCanvas/hooks/useGridDnd";
import { MobileReadonlyBlock } from "./MobileReadonlyBlock";
import { snapToCursor } from "@/lib/dndKit";
import { DroppableCell } from "../DroppableCell";
import styles from "../BlockCanvas.module.css";

type MobileCanvasGridProps =
  | {
      editable: true;
      blocks: Block[];
      onUpdateBlock: (id: string, updates: Partial<Block>) => void;
    }
  | {
      editable: false;
      blocks: Block[];
    };

export const MobileCanvasGrid = (props: MobileCanvasGridProps) => {
  const { editable, blocks } = props;
  const editor = useEditorContext();

  const applyUpdate =
    editable && props.onUpdateBlock ? props.onUpdateBlock : () => undefined;

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
  } = useGridDnd({
    editable,
    blocks,
    updateBlock: applyUpdate,
    onPersistBlockUpdate: editor?.onUpdateBlock,
    gridConfig: MOBILE_GRID,
  });

  const activeBlock = useMemo(() => {
    if (!activeId) return null;
    return blocks.find((block) => block.id === activeId) ?? null;
  }, [activeId, blocks]);

  const maxBottom = blocks.reduce((acc, block) => {
    const rect = rectForBlock(block, undefined, MOBILE_GRID);
    return Math.max(acc, rect.y + rect.h);
  }, 0);

  const trailingRows = activeId ? 4 : 1;
  const subRows = Math.max(
    1,
    Math.ceil(maxBottom * MOBILE_GRID.rowScale) +
      trailingRows * MOBILE_GRID.rowScale,
  );

  const gridXStridePx = MOBILE_GRID.cellPx + MOBILE_GRID.gapXPx;
  const gridYStridePx = MOBILE_GRID.subRowPx + MOBILE_GRID.subRowGapPx;

  const placementHighlightStyle = useMemo(() => {
    if (!activeBlock || !placementTarget) return null;

    const { widthPx, heightPx } = sizePxForBlock(activeBlock, MOBILE_GRID);

    return {
      transform: `translate3d(${placementTarget.x * gridXStridePx}px, ${placementTarget.y * MOBILE_GRID.rowScale * gridYStridePx}px, 0)`,
      width: `${widthPx}px`,
      height: `${heightPx}px`,
    };
  }, [activeBlock, placementTarget, gridXStridePx, gridYStridePx]);

  const content = (
    <div
      className={styles.canvas}
      style={{
        height: `${subRows * MOBILE_GRID.subRowPx + (subRows - 1) * MOBILE_GRID.subRowGapPx}px`,
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
          className={`${styles.dropGrid} ${styles.dropGridMobile} ${activeId ? styles.dropGridActive : ""}`}
          style={{
            gridTemplateRows: `repeat(${subRows}, ${MOBILE_GRID.subRowPx}px)`,
            // Override grid template columns for mobile (2 cols)
            gridTemplateColumns: `repeat(${MOBILE_GRID.cols}, ${MOBILE_GRID.cellPx}px)`,
            gap: `${MOBILE_GRID.subRowGapPx}px ${MOBILE_GRID.gapXPx}px`,
          }}
        >
          {Array.from({ length: subRows }).flatMap((_, y) =>
            Array.from({ length: MOBILE_GRID.cols }).map((__, x) => (
              <DroppableCell key={`${x}-${y}`} x={x} y={y} />
            )),
          )}
        </div>
      )}

      <div className={styles.gridMobile}>
        {blocks.map((block, index) => {
          const { w: spanW, h: spanH } = spansForBlock(
            block,
            undefined,
            MOBILE_GRID,
          );
          const xRaw = block.layout?.x ?? index % MOBILE_GRID.cols;
          const yRaw = block.layout?.y ?? Math.floor(index / MOBILE_GRID.cols);
          const x = clamp(xRaw, 0, MOBILE_GRID.cols - spanW);
          const y = Math.max(0, yRaw);
          const dimensions = sizePxForBlock(block, MOBILE_GRID);

          return (
            <div
              key={block.id}
              ref={(node) => {
                registerBlockNode(block.id, node);
              }}
              style={{
                gridColumnStart: x + 1,
                gridRowStart: Math.round(y * MOBILE_GRID.rowScale) + 1,
                gridColumnEnd: `span ${spanW}`,
                gridRowEnd: `span ${Math.max(1, Math.round(spanH * MOBILE_GRID.rowScale))}`,
              }}
            >
              {editable ? (
                <SortableBlock
                  block={block}
                  dimensions={dimensions}
                  activeDragId={activeId}
                  gridConfig={MOBILE_GRID}
                />
              ) : (
                <MobileReadonlyBlock block={block} dimensions={dimensions} />
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
      collisionDetection={snapToCursor}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {content}
    </DndContext>
  );
};
