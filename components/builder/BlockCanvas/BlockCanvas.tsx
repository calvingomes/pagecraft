"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragOverEvent,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useMemo, useRef, useState } from "react";
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
import type { GridLayout } from "@/types/grid";
import {
  computePushedLayouts,
  computeTargetFromOver,
  maxStartYFor,
  type LayoutById,
} from "@/components/builder/BlockCanvas/blockCanvasLayout";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(media.matches);
    update();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    // Safari < 14
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return isMobile;
};

const mobileSpanForPreset = (preset: string | undefined): 1 | 2 => {
  switch (preset) {
    case "medium":
    case "wide":
    case "skinnyTall":
      return 2;
    default:
      return 1;
  }
};

function MobileSortableGridItem({ block }: { block: Block }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const preset = block.styles?.widthPreset;
  const span = mobileSpanForPreset(preset);

  return (
    <div
      ref={setNodeRef}
      className={styles.gridMobileItem}
      style={{
        gridColumn: `span ${span}`,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        touchAction: "manipulation",
      }}
      {...attributes}
      {...listeners}
    >
      <SortableBlock block={block} fluid dndDisabled toolbarAlwaysVisible />
    </div>
  );
}

export const BlockCanvas = (props: BlockCanvasProps) => {
  const storeBlocks = useEditorStore((s) => s.blocks);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const reorderBlocks = useEditorStore((s) => s.reorderBlocks);
  const editor = useEditorContext();

  const isMobile = useIsMobile();

  const blockNodeByIdRef = useRef(new Map<string, HTMLDivElement>());
  const flipRafRef = useRef<number | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [placementTarget, setPlacementTarget] = useState<GridLayout | null>(
    null,
  );
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

  const mobileSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (!props.editable) return;
    const startedId = String(event.active.id);
    setActiveId(startedId);
    setPlacementTarget(null);
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
    setPlacementTarget(null);
    setDragSnapshot(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!props.editable) return;
    if (!activeId) return;
    if (!dragSnapshot) return;

    if (!event.over) {
      setPlacementTarget(null);
      return;
    }

    const activeBlock = blocks.find((b) => b.id === activeId);
    if (!activeBlock) return;

    const movingPreset = activeBlock.styles?.widthPreset ?? "small";
    const { w: movingW } = spansForPreset(movingPreset);
    const overId = String(event.over.id);
    const target = computeTargetFromOver(overId, movingW, movingPreset, blocks);
    if (!target) {
      setPlacementTarget(null);
      return;
    }

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

    const nextLayoutIds = Object.keys(nextLayouts);
    const beforeRects = new Map<string, DOMRect>();
    for (const id of nextLayoutIds) {
      if (id === activeId) continue;
      const el = blockNodeByIdRef.current.get(id);
      if (!el) continue;
      beforeRects.set(id, el.getBoundingClientRect());
    }

    for (const [id, layout] of Object.entries(nextLayouts)) {
      updateBlock(id, { layout });
    }

    if (flipRafRef.current) {
      cancelAnimationFrame(flipRafRef.current);
      flipRafRef.current = null;
    }
    flipRafRef.current = requestAnimationFrame(() => {
      for (const [id, before] of beforeRects) {
        const el = blockNodeByIdRef.current.get(id);
        if (!el) continue;
        const after = el.getBoundingClientRect();
        const dx = before.left - after.left;
        const dy = before.top - after.top;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;

        for (const anim of el.getAnimations()) anim.cancel();
        el.animate(
          [
            { transform: `translate3d(${dx}px, ${dy}px, 0)` },
            { transform: "translate3d(0px, 0px, 0)" },
          ],
          {
            duration: 200,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          },
        );
      }
      flipRafRef.current = null;
    });

    setPlacementTarget(clampedTarget);
    setDragSnapshot({ ...dragSnapshot, lastTargetKey: targetKey });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!props.editable) return;
    const snapshot = dragSnapshot;

    setActiveId(null);
    setPlacementTarget(null);
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

  const GRID_CELL_PX = 200;
  const GRID_GAP_PX = 20;
  const GRID_STRIDE_PX = GRID_CELL_PX + GRID_GAP_PX;

  const placementHighlightStyle = (() => {
    if (!activeBlock) return null;
    if (!placementTarget) return null;

    const preset = activeBlock.styles?.widthPreset ?? "small";
    const { widthPx, heightPx } = sizePxForPreset(preset);
    const isSkinnyTall = preset === "skinnyTall";
    const slot = isSkinnyTall ? (placementTarget.slot ?? 0) : 0;
    const slotOffsetY =
      isSkinnyTall && slot === 1 ? GRID_CELL_PX - heightPx : 0;

    const xPx = placementTarget.x * GRID_STRIDE_PX;
    const yPx = placementTarget.y * GRID_STRIDE_PX + slotOffsetY;

    return {
      transform: `translate3d(${xPx}px, ${yPx}px, 0)`,
      width: `${widthPx}px`,
      height: `${heightPx}px`,
    };
  })();

  const DroppableCell = ({ x, y }: { x: number; y: number }) => {
    const { setNodeRef: setTopRef } = useDroppable({
      id: `cellHalf:${x}:${y}:0`,
      data: { type: "cellHalf", x, y, slot: 0 },
    });
    const { setNodeRef: setBottomRef } = useDroppable({
      id: `cellHalf:${x}:${y}:1`,
      data: { type: "cellHalf", x, y, slot: 1 },
    });

    return (
      <div className={styles.dropCell}>
        <div ref={setTopRef} className={styles.dropHalfTop} />
        <div ref={setBottomRef} className={styles.dropHalfBottom} />
      </div>
    );
  };

  // Mobile mode: 2-column responsive grid. In the editor, we support reorder-only.
  if (isMobile) {
    const ordered = [...blocks].slice().sort((a, b) => {
      const ao = typeof a.order === "number" ? a.order : 0;
      const bo = typeof b.order === "number" ? b.order : 0;
      if (ao !== bo) return ao - bo;
      return a.id.localeCompare(b.id);
    });

    const grid = (
      <div className={styles.canvas}>
        <div className={styles.gridMobile}>
          {props.editable ? (
            <SortableContext
              items={ordered.map((b) => b.id)}
              strategy={rectSortingStrategy}
            >
              {ordered.map((block) => (
                <MobileSortableGridItem key={block.id} block={block} />
              ))}
            </SortableContext>
          ) : (
            ordered.map((block) => {
              const span = mobileSpanForPreset(block.styles?.widthPreset);
              return (
                <div
                  key={block.id}
                  className={styles.gridMobileItem}
                  style={{ gridColumn: `span ${span}` }}
                >
                  <SortableBlock block={block} fluid dndDisabled />
                </div>
              );
            })
          )}
        </div>
      </div>
    );

    if (!props.editable) return grid;

    return (
      <DndContext
        sensors={mobileSensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (!over) return;
          const activeId = String(active.id);
          const overId = String(over.id);
          if (activeId === overId) return;
          reorderBlocks(activeId, overId);
        }}
      >
        {grid}
      </DndContext>
    );
  }

  const content = (
    <div
      className={styles.canvas}
      style={{ height: `${rows * GRID_CELL_PX + (rows - 1) * GRID_GAP_PX}px` }}
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
          style={{ gridTemplateRows: `repeat(${rows}, ${GRID_CELL_PX}px)` }}
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
              ref={(node) => {
                if (!node) {
                  blockNodeByIdRef.current.delete(block.id);
                } else {
                  blockNodeByIdRef.current.set(block.id, node);
                }
              }}
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
    </DndContext>
  );
};
