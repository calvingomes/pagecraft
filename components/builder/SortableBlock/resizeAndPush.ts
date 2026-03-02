import type { Block, BlockWidthPreset } from "@/types/editor";
import { compactEmptyRows } from "@/lib/compactEmptyRows";
import { clamp, overlaps, spansForPreset } from "@/lib/blockGrid";

type PlacedRect = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export function computeResizeAndPushUpdates(args: {
  targetBlock: Block;
  allBlocks: Block[];
  nextPreset: BlockWidthPreset;
}): Array<{ id: string; updates: Partial<Block> }> {
  const { targetBlock, allBlocks, nextPreset } = args;

  const currentX = targetBlock.layout?.x ?? 0;
  const currentY = targetBlock.layout?.y ?? 0;

  // Keep the resized block anchored and push others out of the way.
  const movingSpans = spansForPreset(nextPreset);
  const anchored = {
    x: clamp(currentX, 0, 4 - movingSpans.w),
    y: Math.max(0, currentY),
  };

  const placed: PlacedRect[] = [
    {
      id: targetBlock.id,
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

    // Fallback (should rarely happen because rows are effectively unbounded)
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x <= 4 - w; x++) {
        const candidate = { x, y, w, h };
        if (isFree(candidate)) return { x, y };
      }
    }

    return { x: 0, y: 0 };
  };

  // Process blocks in visual order so pushes feel natural.
  const others = allBlocks
    .filter((b) => b.id !== targetBlock.id)
    .slice()
    .sort((a, b) => {
      const ay = a.layout?.y ?? 0;
      const by = b.layout?.y ?? 0;
      if (ay !== by) return ay - by;
      const ax = a.layout?.x ?? 0;
      const bx = b.layout?.x ?? 0;
      return ax - bx;
    });

  const moved: Array<{ id: string; layout: { x: number; y: number } }> = [];

  for (const other of others) {
    const otherPreset = other.styles?.widthPreset ?? "small";
    const { w, h } = spansForPreset(otherPreset);
    const originalX = clamp(other.layout?.x ?? 0, 0, 4 - w);
    const originalY = Math.max(0, other.layout?.y ?? 0);
    const originalRect = { x: originalX, y: originalY, w, h };

    const collides = placed.some((p) => overlaps(originalRect, p));
    const finalPos = collides
      ? findSpotNear(originalX, originalY, w, h)
      : { x: originalX, y: originalY };

    placed.push({ id: other.id, x: finalPos.x, y: finalPos.y, w, h });

    if (finalPos.x !== originalX || finalPos.y !== originalY) {
      moved.push({ id: other.id, layout: finalPos });
    }
  }

  const nextLayoutById = new Map<string, { x: number; y: number }>();
  nextLayoutById.set(targetBlock.id, anchored);
  for (const change of moved) {
    nextLayoutById.set(change.id, change.layout);
  }

  const nextBlocks = allBlocks.map((b) => {
    if (b.id === targetBlock.id) {
      return {
        ...b,
        styles: { ...b.styles, widthPreset: nextPreset },
        layout: anchored,
      } as Block;
    }

    const nextLayout = nextLayoutById.get(b.id);
    if (!nextLayout) return b;
    return { ...b, layout: nextLayout } as Block;
  });

  const compacted = compactEmptyRows(nextBlocks);

  const updates: Array<{ id: string; updates: Partial<Block> }> = [];

  for (const next of compacted.blocks) {
    const prev = allBlocks.find((b) => b.id === next.id);
    if (!prev) continue;

    if (next.id === targetBlock.id) {
      const prevPreset = prev.styles?.widthPreset ?? "small";
      const nextPresetValue = next.styles?.widthPreset ?? "small";
      const prevLayout = prev.layout;
      const nextLayout = next.layout;

      if (
        prevPreset !== nextPresetValue ||
        prevLayout?.x !== nextLayout?.x ||
        prevLayout?.y !== nextLayout?.y
      ) {
        updates.push({
          id: next.id,
          updates: {
            styles: { ...next.styles, widthPreset: nextPreset },
            layout: next.layout,
          },
        });
      }
      continue;
    }

    const prevLayout = prev.layout;
    const nextLayout = next.layout;
    if (!prevLayout || !nextLayout) continue;
    if (prevLayout.x === nextLayout.x && prevLayout.y === nextLayout.y)
      continue;

    updates.push({ id: next.id, updates: { layout: nextLayout } });
  }

  return updates;
}
