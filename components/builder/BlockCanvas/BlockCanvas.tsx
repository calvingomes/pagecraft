"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useEditorStore } from "@/stores/editor-store";
import BlockRenderer from "@/components/builder/BlockRenderer/BlockRenderer";
import { SortableBlock } from "@/components/builder/SortableBlock/SortableBlock";
import type { Block, BlockWidthPreset } from "@/types/editor";
import styles from "./BlockCanvas.module.css";
import { useEditorContext } from "@/contexts/EditorContext";

type BlockCanvasProps =
  | { editable: true }
  | { editable: false; blocks: Block[]; title?: string };

const spanForPreset = (preset: BlockWidthPreset): number => {
  return preset === "medium" ? 2 : 1;
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
  const preset = b.styles?.widthPreset ?? "narrow";
  const w = spanForPreset(preset);
  const h = w;
  const x = b.layout?.x ?? 0;
  const y = b.layout?.y ?? 0;
  return { x, y, w, h };
};

const findOccupyingBlock = (blocks: Block[], cellX: number, cellY: number) => {
  return blocks.find((b) => {
    const r = rectFor(b);
    return (
      cellX >= r.x && cellX < r.x + r.w && cellY >= r.y && cellY < r.y + r.h
    );
  });
};

export const BlockCanvas = (props: BlockCanvasProps) => {
  const storeBlocks = useEditorStore((s) => s.blocks);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const editor = useEditorContext();

  const blocks = props.editable ? storeBlocks : props.blocks;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!props.editable) return;
    if (!editor?.onUpdateBlock) return;

    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeBlock = blocks.find((b) => b.id === activeId);
    if (!activeBlock) return;

    const activeRect = rectFor(activeBlock);
    const activeOld = { x: activeRect.x, y: activeRect.y };
    const movingW = activeRect.w;
    const movingH = activeRect.h;

    const canPlaceAt = (
      x: number,
      y: number,
      ignoreIds: Set<string> = new Set([activeId]),
    ) => {
      const candidate = { x, y, w: movingW, h: movingH };
      if (candidate.x < 0 || candidate.y < 0) return false;
      if (candidate.x + candidate.w > 4) return false;

      return !blocks.some((b) => {
        if (ignoreIds.has(b.id)) return false;
        return overlaps(candidate, rectFor(b));
      });
    };

    const findFirstFreeSpot = () => {
      for (let y = 0; y < 100; y++) {
        for (let x = 0; x <= 4 - movingW; x++) {
          if (canPlaceAt(x, y)) return { x, y };
        }
      }
      return { x: 0, y: 0 };
    };

    let target: { x: number; y: number } | null = null;
    let targetBlock: Block | null = null;

    if (overId.startsWith("cell:")) {
      const parts = overId.split(":");
      const x = Number(parts[1]);
      const y = Number(parts[2]);
      if (!Number.isNaN(x) && !Number.isNaN(y)) {
        target = {
          x: clamp(x, 0, 4 - movingW),
          y: Math.max(0, y),
        };
        targetBlock = findOccupyingBlock(blocks, target.x, target.y) ?? null;
        if (targetBlock?.id === activeId) targetBlock = null;
      }
    } else if (overId.startsWith("block:")) {
      const id = overId.replace("block:", "");
      const b = blocks.find((x) => x.id === id);
      if (b) {
        const r = rectFor(b);
        target = { x: r.x, y: r.y };
        targetBlock = b;
      }
    }

    if (!target) return;

    // If dropping onto another block/cell already occupied, try swap positions.
    if (targetBlock) {
      const swapWith = targetBlock;
      const swapRect = rectFor(swapWith);
      const swapPreset = swapWith.styles?.widthPreset ?? "narrow";
      const swapW = spanForPreset(swapPreset);
      const swapH = swapW;

      const canPlaceSwapAtOld = (() => {
        const candidate = {
          x: activeOld.x,
          y: activeOld.y,
          w: swapW,
          h: swapH,
        };
        if (candidate.x < 0 || candidate.y < 0) return false;
        if (candidate.x + candidate.w > 4) return false;
        return !blocks.some((b) => {
          if (b.id === activeId || b.id === swapWith.id) return false;
          return overlaps(candidate, rectFor(b));
        });
      })();

      const canPlaceActiveAtTarget = canPlaceAt(
        target.x,
        target.y,
        new Set([activeId, swapWith.id]),
      );

      if (canPlaceActiveAtTarget && canPlaceSwapAtOld) {
        updateBlock(activeId, { layout: target });
        updateBlock(swapWith.id, { layout: activeOld });
        void editor.onUpdateBlock(activeId, { layout: target });
        void editor.onUpdateBlock(swapWith.id, { layout: activeOld });
        return;
      }
    }

    // Move active block to the target if possible, otherwise fall back to first free.
    const finalPos = canPlaceAt(target.x, target.y)
      ? target
      : findFirstFreeSpot();

    updateBlock(activeId, { layout: finalPos });
    void editor.onUpdateBlock(activeId, { layout: finalPos });
  };

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
          const preset = block.styles?.widthPreset ?? "narrow";
          const span = spanForPreset(preset);
          const x = block.layout?.x ?? index % 4;
          const y = block.layout?.y ?? Math.floor(index / 4);
          return (
            <div
              key={block.id}
              style={{
                gridColumnStart: x + 1,
                gridRowStart: y + 1,
                gridColumnEnd: `span ${span}`,
                gridRowEnd: `span ${span}`,
              }}
            >
              {props.editable ? (
                <SortableBlock block={block} />
              ) : (
                <BlockRenderer block={block} />
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
      onDragEnd={handleDragEnd}
    >
      {content}
    </DndContext>
  );
};
