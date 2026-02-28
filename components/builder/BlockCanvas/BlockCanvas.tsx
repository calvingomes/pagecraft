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
  type DragCancelEvent,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import BlockRenderer from "@/components/builder/BlockRenderer/BlockRenderer";
import { SortableBlock } from "@/components/builder/SortableBlock/SortableBlock";
import sortableBlockStyles from "@/components/builder/SortableBlock/SortableBlock.module.css";
import type { Block, BlockWidthPreset } from "@/types/editor";
import styles from "./BlockCanvas.module.css";
import { useEditorContext } from "@/contexts/EditorContext";

type BlockCanvasProps =
  | { editable: true }
  | { editable: false; blocks: Block[]; title?: string };

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

const sizePxForPreset = (preset: BlockWidthPreset) => {
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

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

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

const rectFor = (b: Block) => {
  const preset = b.styles?.widthPreset ?? "small";
  const { w, h } = spansForPreset(preset);
  const x = b.layout?.x ?? 0;
  const y = b.layout?.y ?? 0;
  return { x, y, w, h };
};

export const BlockCanvas = (props: BlockCanvasProps) => {
  const storeBlocks = useEditorStore((s) => s.blocks);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const editor = useEditorContext();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragSnapshot, setDragSnapshot] = useState<null | {
    layouts: Record<string, { x: number; y: number } | undefined>;
    lastTargetKey: string | null;
  }>(null);

  const blocks = props.editable ? storeBlocks : props.blocks;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const computeTargetFromOver = (
    overId: string,
    movingW: number,
  ): { x: number; y: number } | null => {
    if (overId.startsWith("cell:")) {
      const parts = overId.split(":");
      const x = Number(parts[1]);
      const y = Number(parts[2]);
      if (!Number.isNaN(x) && !Number.isNaN(y)) {
        return {
          x: clamp(x, 0, 4 - movingW),
          y: Math.max(0, y),
        };
      }
    }

    if (overId.startsWith("block:")) {
      const id = overId.replace("block:", "");
      const b = blocks.find((x) => x.id === id);
      if (b) {
        const r = rectFor(b);
        return {
          x: clamp(r.x, 0, 4 - movingW),
          y: Math.max(0, r.y),
        };
      }
    }

    return null;
  };

  const computePushedLayouts = (
    movingId: string,
    target: { x: number; y: number },
    sourceLayouts: Record<string, { x: number; y: number } | undefined>,
  ) => {
    const movingBlock = blocks.find((b) => b.id === movingId);
    if (!movingBlock) return null;

    const movingPreset = movingBlock.styles?.widthPreset ?? "small";
    const movingSpans = spansForPreset(movingPreset);
    const anchored = {
      x: clamp(target.x, 0, 4 - movingSpans.w),
      y: Math.max(0, target.y),
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
        id: movingId,
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

      for (let y = 0; y < 100; y++) {
        for (let x = 0; x <= 4 - w; x++) {
          const candidate = { x, y, w, h };
          if (isFree(candidate)) return { x, y };
        }
      }

      return { x: 0, y: 0 };
    };

    const others = blocks
      .filter((b) => b.id !== movingId)
      .slice()
      .sort((a, b) => {
        const ay = (sourceLayouts[a.id] ?? a.layout)?.y ?? 0;
        const by = (sourceLayouts[b.id] ?? b.layout)?.y ?? 0;
        if (ay !== by) return ay - by;
        const ax = (sourceLayouts[a.id] ?? a.layout)?.x ?? 0;
        const bx = (sourceLayouts[b.id] ?? b.layout)?.x ?? 0;
        return ax - bx;
      });

    const nextLayouts: Record<string, { x: number; y: number }> = {
      [movingId]: anchored,
    };

    for (const other of others) {
      const otherPreset = other.styles?.widthPreset ?? "small";
      const { w, h } = spansForPreset(otherPreset);
      const source = sourceLayouts[other.id] ?? other.layout;
      const originalX = clamp(source?.x ?? 0, 0, 4 - w);
      const originalY = Math.max(0, source?.y ?? 0);
      const originalRect = { x: originalX, y: originalY, w, h };

      const collides = placed.some((p) => overlaps(originalRect, p));
      const finalPos = collides
        ? findSpotNear(originalX, originalY, w, h)
        : { x: originalX, y: originalY };

      placed.push({ id: other.id, x: finalPos.x, y: finalPos.y, w, h });
      nextLayouts[other.id] = finalPos;
    }

    return nextLayouts;
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (!props.editable) return;
    const startedId = String(event.active.id);
    setActiveId(startedId);
    setDragSnapshot({
      layouts: Object.fromEntries(
        blocks.map((b) => [
          b.id,
          b.layout ? { x: b.layout.x, y: b.layout.y } : undefined,
        ]),
      ),
      lastTargetKey: null,
    });
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
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
    const target = computeTargetFromOver(overId, movingW);
    if (!target) return;

    const targetKey = `${activeId}:${target.x}:${target.y}`;
    if (dragSnapshot.lastTargetKey === targetKey) return;

    const nextLayouts = computePushedLayouts(
      activeId,
      target,
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
    const target = computeTargetFromOver(overId, movingW);
    if (!target) return;

    const sourceLayouts =
      snapshot?.layouts ??
      Object.fromEntries(
        blocks.map((b) => [
          b.id,
          b.layout ? { x: b.layout.x, y: b.layout.y } : undefined,
        ]),
      );

    const nextLayouts = computePushedLayouts(
      activeBlockId,
      target,
      sourceLayouts,
    );
    if (!nextLayouts) return;

    for (const [id, layout] of Object.entries(nextLayouts)) {
      updateBlock(id, { layout });
    }

    for (const [id, layout] of Object.entries(nextLayouts)) {
      const before = sourceLayouts[id];
      if (before?.x === layout.x && before?.y === layout.y) continue;
      void editor.onUpdateBlock(id, { layout });
    }
  };

  const activeBlock = useMemo(() => {
    if (!activeId) return null;
    return blocks.find((b) => b.id === activeId) ?? null;
  }, [activeId, blocks]);

  const maxBottom = blocks.reduce((acc, b) => {
    const r = rectFor(b);
    return Math.max(acc, r.y + r.h);
  }, 0);
  const rows = Math.max(12, maxBottom + 6);

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
                  return (
                    <div className={sortableBlockStyles.hoverZone}>
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
