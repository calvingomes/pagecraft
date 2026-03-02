import type { Block, BlockWidthPreset } from "@/types/editor";
import type { GridLayout } from "@/types/grid";
import { compactEmptyRows } from "@/lib/compactEmptyRows";
import { clamp, overlaps, spansForPreset } from "@/lib/blockGrid";

const isSkinny = (preset: BlockWidthPreset | undefined) =>
  preset === "skinnyWide";

// We use a half-row unit system to support `skinnyWide` stacking.
// - Normal blocks: yUnits = y * 2, hUnits = spans.h * 2
// - skinnyWide:   yUnits = y * 2 + slot, hUnits = 1
const yUnitsFor = (
  layout: GridLayout | undefined,
  preset: BlockWidthPreset,
) => {
  const y = Math.max(0, layout?.y ?? 0);
  if (!isSkinny(preset)) return y * 2;
  const slot = layout?.slot ?? 0;
  return y * 2 + (slot === 1 ? 1 : 0);
};

const hUnitsFor = (preset: BlockWidthPreset) => {
  if (isSkinny(preset)) return 1;
  const { h } = spansForPreset(preset);
  return h * 2;
};

type PlacedRect = {
  id: string;
  x: number;
  y: number; // y in half-row units
  w: number;
  h: number; // h in half-row units
};

export function computeResizeAndPushUpdates(args: {
  targetBlock: Block;
  allBlocks: Block[];
  nextPreset: BlockWidthPreset;
}): Array<{ id: string; updates: Partial<Block> }> {
  const { targetBlock, allBlocks, nextPreset } = args;

  const currentX = targetBlock.layout?.x ?? 0;
  const currentY = targetBlock.layout?.y ?? 0;
  const currentSlot = targetBlock.layout?.slot;

  // Keep the resized block anchored and push others out of the way.
  const movingSpans = spansForPreset(nextPreset);
  const anchored: GridLayout = {
    x: clamp(currentX, 0, 4 - movingSpans.w),
    y: Math.max(0, currentY),
    ...(isSkinny(nextPreset) ? { slot: (currentSlot ?? 0) as 0 | 1 } : {}),
  };

  const anchoredYUnits = yUnitsFor(anchored, nextPreset);
  const anchoredHUnits = hUnitsFor(nextPreset);

  const placed: PlacedRect[] = [
    {
      id: targetBlock.id,
      x: anchored.x,
      y: anchoredYUnits,
      w: movingSpans.w,
      h: anchoredHUnits,
    },
  ];

  const isFree = (candidate: Omit<PlacedRect, "id">) => {
    if (candidate.x < 0 || candidate.y < 0) return false;
    if (candidate.x + candidate.w > 4) return false;
    return !placed.some((p) => overlaps(candidate, p));
  };

  const findSpotNear = (
    startX: number,
    startYUnits: number,
    w: number,
    hUnits: number,
    yStep: number,
  ) => {
    const normalizedStartX = clamp(startX, 0, 4 - w);
    const normalizedStartY = Math.max(0, startYUnits);

    const xCandidates = Array.from({ length: 4 - w + 1 }, (_, i) => i).filter(
      (x) => x !== normalizedStartX,
    );
    const orderedXCandidates = [normalizedStartX, ...xCandidates];

    for (let y = normalizedStartY; y < 200; y += yStep) {
      for (const x of orderedXCandidates) {
        const candidate = { x, y, w, h: hUnits };
        if (isFree(candidate)) return { x, y };
      }
    }

    // Fallback (should rarely happen because rows are effectively unbounded)
    for (let y = 0; y < 200; y += yStep) {
      for (let x = 0; x <= 4 - w; x++) {
        const candidate = { x, y, w, h: hUnits };
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
      const aPreset = a.styles?.widthPreset ?? "small";
      const bPreset = b.styles?.widthPreset ?? "small";
      const ay = yUnitsFor(a.layout, aPreset);
      const by = yUnitsFor(b.layout, bPreset);
      if (ay !== by) return ay - by;
      const ax = a.layout?.x ?? 0;
      const bx = b.layout?.x ?? 0;
      return ax - bx;
    });

  const moved: Array<{ id: string; layout: GridLayout }> = [];

  for (const other of others) {
    const otherPreset = other.styles?.widthPreset ?? "small";
    const { w } = spansForPreset(otherPreset);
    const hUnits = hUnitsFor(otherPreset);
    const yStep = isSkinny(otherPreset) ? 1 : 2;
    const originalX = clamp(other.layout?.x ?? 0, 0, 4 - w);
    const originalYUnits = yUnitsFor(other.layout, otherPreset);
    const alignedOriginalYUnits = isSkinny(otherPreset)
      ? originalYUnits
      : originalYUnits - (originalYUnits % 2);

    const originalRect = { x: originalX, y: originalYUnits, w, h: hUnits };

    const collides = placed.some((p) => overlaps(originalRect, p));
    const finalPos = collides
      ? findSpotNear(originalX, alignedOriginalYUnits, w, hUnits, yStep)
      : { x: originalX, y: originalYUnits };

    placed.push({ id: other.id, x: finalPos.x, y: finalPos.y, w, h: hUnits });

    const nextLayout: GridLayout = isSkinny(otherPreset)
      ? {
          x: finalPos.x,
          y: Math.floor(finalPos.y / 2),
          slot: (finalPos.y % 2) as 0 | 1,
        }
      : {
          x: finalPos.x,
          y: Math.floor(finalPos.y / 2),
        };

    const prevLayout: GridLayout = isSkinny(otherPreset)
      ? {
          x: originalX,
          y: Math.floor(originalYUnits / 2),
          slot: (originalYUnits % 2) as 0 | 1,
        }
      : {
          x: originalX,
          y: Math.floor(originalYUnits / 2),
        };

    const movedThisOne =
      nextLayout.x !== prevLayout.x ||
      nextLayout.y !== prevLayout.y ||
      (nextLayout.slot ?? 0) !== (prevLayout.slot ?? 0);

    if (movedThisOne) {
      moved.push({ id: other.id, layout: nextLayout });
    }
  }

  const nextLayoutById = new Map<string, GridLayout>();
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
    if (
      prevLayout.x === nextLayout.x &&
      prevLayout.y === nextLayout.y &&
      (prevLayout.slot ?? 0) === (nextLayout.slot ?? 0)
    )
      continue;

    updates.push({ id: next.id, updates: { layout: nextLayout } });
  }

  return updates;
}
