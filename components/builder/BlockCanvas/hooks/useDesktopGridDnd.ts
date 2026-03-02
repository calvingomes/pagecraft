"use client";

import { useRef, useState } from "react";
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import type { Block } from "@/types/editor";
import type { GridLayout } from "@/types/grid";
import type { LayoutById } from "@/components/builder/BlockCanvas/blockCanvasLayout";
import {
  computePushedLayouts,
  computeTargetFromOver,
  maxStartYFor,
} from "@/components/builder/BlockCanvas/blockCanvasLayout";
import { clamp, spansForPreset } from "@/lib/blockGrid";
import { compactEmptyRows } from "@/lib/compactEmptyRows";

export type DesktopDndSnapshot = {
  layouts: LayoutById;
  lastTargetKey: string | null;
};

type UseDesktopGridDndArgs = {
  editable: boolean;
  blocks: Block[];
  updateBlock: (id: string, updates: Partial<Block>) => void;
  onPersistBlockUpdate?: (
    id: string,
    updates: Partial<Block>,
  ) => void | Promise<void>;
};

export function useDesktopGridDnd({
  editable,
  blocks,
  updateBlock,
  onPersistBlockUpdate,
}: UseDesktopGridDndArgs) {
  const blockNodeByIdRef = useRef(new Map<string, HTMLDivElement>());
  const flipRafRef = useRef<number | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [placementTarget, setPlacementTarget] = useState<GridLayout | null>(
    null,
  );
  const [dragSnapshot, setDragSnapshot] = useState<DesktopDndSnapshot | null>(
    null,
  );

  const registerBlockNode = (id: string, node: HTMLDivElement | null) => {
    if (!node) {
      blockNodeByIdRef.current.delete(id);
    } else {
      blockNodeByIdRef.current.set(id, node);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (!editable) return;
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
    if (!editable) return;
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

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!editable) return;
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

    if (!onPersistBlockUpdate) return;

    await Promise.all(
      compacted.blocks.map(async (b) => {
        const before = sourceLayouts[b.id];
        const after = b.layout;
        if (!after) return;
        if (before?.x === after.x && before?.y === after.y) return;
        await onPersistBlockUpdate(b.id, { layout: after });
      }),
    );
  };

  return {
    activeId,
    placementTarget,
    dragSnapshot,
    registerBlockNode,
    handleDragStart,
    handleDragCancel,
    handleDragOver,
    handleDragEnd,
  };
}
