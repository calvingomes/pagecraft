"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragOverEvent,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import BlockRenderer from "@/components/builder/BlockRenderer/BlockRenderer";
import { SortableBlock } from "@/components/builder/SortableBlock/SortableBlock";
import sortableBlockStyles from "@/components/builder/SortableBlock/SortableBlock.module.css";
import type { Block } from "@/types/editor";
import type { BlockCanvasProps } from "@/types/builder";
import styles from "./BlockCanvas.module.css";
import { useEditorContext } from "@/contexts/EditorContext";
import { compactEmptyRows } from "@/lib/compactEmptyRows";
import {
  sizePxForPreset,
  spansForPreset,
  clamp,
  rectForBlock,
} from "@/lib/blockGrid";
import {
  computePushedLayouts,
  computeTargetFromOver,
  maxStartYFor,
  type LayoutById,
} from "@/components/builder/BlockCanvas/blockCanvasLayout";

export const BlockCanvas = (props: BlockCanvasProps) => {
  const storeBlocks = useEditorStore((s) => s.blocks);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const editor = useEditorContext();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragSnapshot, setDragSnapshot] = useState<null | {
    layouts: LayoutById;
    lastTargetKey: string | null;
  }>(null);

  const blocks = props.editable ? storeBlocks : props.blocks;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (!props.editable) return;
    const startedId = String(event.active.id);
    setActiveId(startedId);
    setDragSnapshot({
      layouts: Object.fromEntries(
        blocks.map((b) => [
          b.id,
          b.layout
            ? { x: b.layout.x, y: b.layout.y, slot: b.layout.slot }
            : undefined,
        ]),
      ),
      lastTargetKey: null,
    });
  };

  const handleDragCancel = () => {
    if (dragSnapshot) {
      for (const [id, layout] of Object.entries(dragSnapshot.layouts)) {
        updateBlock(id, { layout });
      }
    }
    setActiveId(null);
    setDragSnapshot(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!props.editable) return;
    if (!activeId) return;
    if (!dragSnapshot) return;
    if (!event.over) return;

    const activeBlock = blocks.find((b) => b.id === activeId);
    if (!activeBlock) return;

    const movingPreset = activeBlock.styles?.widthPreset ?? "small";
    const { w: movingW } = spansForPreset(movingPreset);
    const overId = String(event.over.id);
    const target = computeTargetFromOver(overId, movingW, movingPreset, blocks);
    if (!target) return;

    const maxStartY = maxStartYFor(blocks, activeId, dragSnapshot.layouts);
    const clampedTarget = {
      ...target,
      y: clamp(target.y, 0, maxStartY),
    };

    const targetKey = `${activeId}:${clampedTarget.x}:${clampedTarget.y}:${clampedTarget.slot ?? "_"}`;
    if (dragSnapshot.lastTargetKey === targetKey) return;

    const nextLayouts = computePushedLayouts(
      activeId,
      clampedTarget,
      blocks,
      dragSnapshot.layouts,
    );
    if (!nextLayouts) return;

    for (const [id, layout] of Object.entries(nextLayouts)) {
      updateBlock(id, { layout });
    }

    setDragSnapshot({ ...dragSnapshot, lastTargetKey: targetKey });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!props.editable) return;
    const snapshot = dragSnapshot;

    setActiveId(null);
    setDragSnapshot(null);

    const { active, over } = event;
    if (!over) {
      if (snapshot) {
        for (const [id, layout] of Object.entries(snapshot.layouts)) {
          updateBlock(id, { layout });
        }
      }
      return;
    }
    const activeBlockId = String(active.id);
    const overId = String(over.id);
    if (activeBlockId === overId) {
      if (snapshot) {
        for (const [id, layout] of Object.entries(snapshot.layouts)) {
          updateBlock(id, { layout });
        }
      }
      return;
    }

    if (!editor?.onUpdateBlock) return;

    const activeBlock = blocks.find((b) => b.id === activeBlockId);
    if (!activeBlock) return;

    const movingPreset = activeBlock.styles?.widthPreset ?? "small";
    const { w: movingW } = spansForPreset(movingPreset);
    const targetRaw = computeTargetFromOver(
      overId,
      movingW,
      movingPreset,
      blocks,
    );
    if (!targetRaw) return;

    const sourceLayouts =
      snapshot?.layouts ??
      Object.fromEntries(
        blocks.map((b) => [
          b.id,
          b.layout
            ? { x: b.layout.x, y: b.layout.y, slot: b.layout.slot }
            : undefined,
        ]),
      );

    const maxStartY = maxStartYFor(blocks, activeBlockId, sourceLayouts);
    const target = {
      ...targetRaw,
      y: clamp(targetRaw.y, 0, maxStartY),
    };

    const nextLayouts = computePushedLayouts(
      activeBlockId,
      target,
      blocks,
      sourceLayouts,
    );
    if (!nextLayouts) return;

    const postMoveBlocks = blocks.map((b) => {
      const layout = nextLayouts[b.id];
      return layout ? ({ ...b, layout } as Block) : b;
    });

    const compacted = compactEmptyRows(postMoveBlocks);

    for (const b of compacted.blocks) {
      const current = blocks.find((x) => x.id === b.id);
      if (!current) continue;
      const next = b.layout;
      const prev = current.layout;
      if (!next || !prev) continue;
      if (prev.x === next.x && prev.y === next.y) continue;
      updateBlock(b.id, { layout: next });
    }

    for (const b of compacted.blocks) {
      const before = sourceLayouts[b.id];
      const after = b.layout;
      if (!after) continue;
      if (before?.x === after.x && before?.y === after.y) continue;
      void editor.onUpdateBlock(b.id, { layout: after });
    }
  };

  const activeBlock = useMemo(() => {
    if (!activeId) return null;
    return blocks.find((b) => b.id === activeId) ?? null;
  }, [activeId, blocks]);

  const maxBottom = blocks.reduce((acc, b) => {
    const r = rectForBlock(b);
    return Math.max(acc, r.y + r.h);
  }, 0);
  // Render only what we need: occupied rows + 1 trailing empty row.
  const rows = Math.max(1, maxBottom + 1);

  const DroppableCell = ({ x, y }: { x: number; y: number }) => {
    const { setNodeRef: setFullRef } = useDroppable({
      id: `cell:${x}:${y}`,
      data: { type: "cell", x, y },
    });
    const { setNodeRef: setTopRef } = useDroppable({
      id: `cellHalf:${x}:${y}:0`,
      data: { type: "cellHalf", x, y, slot: 0 },
    });
    const { setNodeRef: setBottomRef } = useDroppable({
      id: `cellHalf:${x}:${y}:1`,
      data: { type: "cellHalf", x, y, slot: 1 },
    });

    return (
      <div ref={setFullRef} className={styles.dropCell}>
        <div ref={setTopRef} className={styles.dropHalfTop} />
        <div ref={setBottomRef} className={styles.dropHalfBottom} />
      </div>
    );
  };

  const content = (
    <div
      className={styles.canvas}
      style={{ height: `${rows * 200 + (rows - 1) * 20}px` }}
    >
      {props.editable && (
        <div
          className={styles.dropGrid}
          style={{ gridTemplateRows: `repeat(${rows}, 200px)` }}
        >
          {Array.from({ length: rows }).flatMap((_, y) =>
            Array.from({ length: 4 }).map((__, x) => (
              <DroppableCell key={`${x}-${y}`} x={x} y={y} />
            )),
          )}
        </div>
      )}
      <div className={styles.grid}>
        {blocks.map((block: Block, index: number) => {
          const preset = block.styles?.widthPreset ?? "small";
          const { w: spanW, h: spanH } = spansForPreset(preset);
          const xRaw = block.layout?.x ?? index % 4;
          const yRaw = block.layout?.y ?? Math.floor(index / 4);
          const x = clamp(xRaw, 0, 4 - spanW);
          const y = Math.max(0, yRaw);
          return (
            <div
              key={block.id}
              style={{
                gridColumnStart: x + 1,
                gridRowStart: y + 1,
                gridColumnEnd: `span ${spanW}`,
                gridRowEnd: `span ${spanH}`,
              }}
            >
              {props.editable ? (
                <SortableBlock block={block} activeDragId={activeId} />
              ) : (
                (() => {
                  const { widthPx, heightPx } = sizePxForPreset(preset);
                  const slot = block.layout?.slot ?? 0;
                  const isSkinnyTall = preset === "skinnyTall";
                  return (
                    <div
                      className={sortableBlockStyles.hoverZone}
                      style={
                        isSkinnyTall && slot === 1
                          ? { alignItems: "flex-end" }
                          : undefined
                      }
                    >
                      <div
                        className={sortableBlockStyles.wrapper}
                        style={{
                          width: `${widthPx}px`,
                          height: `${heightPx}px`,
                          maxWidth: "100%",
                          maxHeight: "100%",
                          cursor: "default",
                        }}
                      >
                        <div className={sortableBlockStyles.content}>
                          <div className={sortableBlockStyles.blockContent}>
                            <BlockRenderer block={block} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
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

      <DragOverlay adjustScale={false}>
        {activeBlock
          ? (() => {
              const { widthPx, heightPx } = sizePxForPreset(
                activeBlock.styles?.widthPreset ?? "small",
              );
              return (
                <div
                  className={sortableBlockStyles.wrapper}
                  style={{
                    pointerEvents: "none",
                    width: `${widthPx}px`,
                    height: `${heightPx}px`,
                  }}
                >
                  <div className={sortableBlockStyles.content}>
                    <div className={sortableBlockStyles.blockContent}>
                      <BlockRenderer block={activeBlock} />
                    </div>
                  </div>
                </div>
              );
            })()
          : null}
      </DragOverlay>
    </DndContext>
  );
};
