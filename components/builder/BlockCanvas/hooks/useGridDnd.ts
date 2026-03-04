"use client";

import { useRef, useState } from "react";
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import type { Block } from "@/types/editor";
import type { GridConfig, GridLayout } from "@/types/grid";
import type {
  DesktopDndSnapshot,
  UseDesktopGridDndArgs,
} from "@/types/builder";
import {
  computePushedLayouts,
  computeTargetFromOver,
} from "@/components/builder/BlockCanvas/blockCanvasLayout";
import { spansForPreset } from "@/lib/blockGrid";
import { compactEmptyRows } from "@/lib/compactEmptyRows";

interface UseGridDndArgs extends Omit<UseDesktopGridDndArgs, "blocks"> {
  blocks: Block[];
  gridConfig: GridConfig;
}

export function useGridDnd({
  editable,
  blocks,
  updateBlock,
  onPersistBlockUpdate,
  gridConfig,
}: UseGridDndArgs) {
  const blockNodeByIdRef = useRef(new Map<string, HTMLDivElement>());
  const flipRafRef = useRef<number | null>(null);
  const lastTargetKeyRef = useRef<string | null>(null);

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
    lastTargetKeyRef.current = null;
    setDragSnapshot({
      layouts: Object.fromEntries(
        blocks.map((b) => [
          b.id,
          b.layout ? { x: b.layout.x, y: b.layout.y } : undefined,
        ]),
      ),
    });
  };

  const handleDragCancel = () => {
    if (dragSnapshot) {
      for (const [id, layout] of Object.entries(dragSnapshot.layouts)) {
        updateBlock(id, { layout });
      }
    }
    lastTargetKeyRef.current = null;
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

    const overId = String(event.over.id);

    // Fix: If we are over the active block itself (the placeholder), ignore it.
    // This prevents self-collision jitter where the cursor snaps to the block being dragged
    // instead of the cell underneath it.
    if (overId === activeId || overId === `block:${activeId}`) {
      return;
    }

    const activeBlock = blocks.find((b) => b.id === activeId);
    if (!activeBlock) return;

    const movingPreset = activeBlock.styles?.widthPreset ?? "small";
    const { w: movingW } = spansForPreset(movingPreset, gridConfig);
    const target = computeTargetFromOver(overId, movingW, blocks, gridConfig);
    if (!target) {
      setPlacementTarget(null);
      return;
    }

    const targetKey = `${activeId}:${target.x}:${target.y}`;
    if (lastTargetKeyRef.current === targetKey) return;

    // Throttle updates to avoid rapid-fire layout shifts during fast scrolls
    // or when hovering between two rows.
    // We can use a simple timestamp check if needed, but for now let's rely on
    // the targetKey check and maybe adding a small delay if it feels too jittery.
    // But the user said "jumps to top or bottom". This usually happens when
    // `computeTargetFromOver` returns (0,0) or a very large Y unexpectedly.

    // Let's verify target validity.
    if (target.y < 0) return;

    const nextLayouts = computePushedLayouts(
      activeId,
      target,
      blocks,
      dragSnapshot.layouts,
      gridConfig,
    );
    if (!nextLayouts) return;

    let changedIds = 0;
    for (const [id, layout] of Object.entries(nextLayouts)) {
      const current = blocks.find((b) => b.id === id)?.layout;
      if (!current || current.x !== layout.x || current.y !== layout.y) {
        changedIds += 1;
      }
    }

    if (changedIds === 0) {
      lastTargetKeyRef.current = targetKey;
      setPlacementTarget(target);
      return;
    }

    const nextLayoutIds = Object.keys(nextLayouts);
    const beforeRects = new Map<string, DOMRect>();
    for (const id of nextLayoutIds) {
      if (id === activeId) continue;
      const el = blockNodeByIdRef.current.get(id);
      if (!el) continue;
      beforeRects.set(id, el.getBoundingClientRect());
    }

    for (const [id, layout] of Object.entries(nextLayouts)) {
      const current = blocks.find((b) => b.id === id)?.layout;
      if (current && current.x === layout.x && current.y === layout.y) {
        continue;
      }
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

    setPlacementTarget(target);
    lastTargetKeyRef.current = targetKey;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!editable) return;
    const snapshot = dragSnapshot;

    setActiveId(null);
    setPlacementTarget(null);
    setDragSnapshot(null);
    lastTargetKeyRef.current = null;

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
    const { w: movingW } = spansForPreset(movingPreset, gridConfig);
    const target = computeTargetFromOver(overId, movingW, blocks, gridConfig);
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
      blocks,
      sourceLayouts,
      gridConfig,
    );
    if (!nextLayouts) return;

    const postMoveBlocks = blocks.map((b) => {
      const layout = nextLayouts[b.id];
      return layout ? ({ ...b, layout } as Block) : b;
    });

    const compacted = compactEmptyRows(postMoveBlocks, gridConfig);

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
