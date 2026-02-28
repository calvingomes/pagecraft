import type { Block, BlockWidthPreset } from "@/types/editor";
import type { GridLayout, PlacedRect } from "@/types/grid";
import { clamp, overlaps, spansForPreset } from "@/lib/blockGrid";

export type LayoutById = Record<string, GridLayout | undefined>;

const isSkinny = (preset: BlockWidthPreset | undefined) =>
  preset === "skinnyTall";

const yUnitsFor = (
  layout: GridLayout | undefined,
  preset: BlockWidthPreset | undefined,
) => {
  const y = Math.max(0, layout?.y ?? 0);
  if (!isSkinny(preset)) return y * 2;
  const slot = layout?.slot ?? 0;
  return y * 2 + (slot === 1 ? 1 : 0);
};

const hUnitsFor = (preset: BlockWidthPreset | undefined) => {
  if (isSkinny(preset)) return 1;
  const { h } = spansForPreset(preset);
  return h * 2;
};

export function rectForBlock(block: Block, layouts?: LayoutById) {
  const { w, h } = spansForPreset(block.styles?.widthPreset);
  const at = layouts?.[block.id] ?? block.layout;
  const x = at?.x ?? 0;
  const y = at?.y ?? 0;
  return { x, y, w, h };
}

export function maxStartYFor(
  blocks: Block[],
  movingId: string,
  sourceLayouts: LayoutById,
): number {
  return blocks
    .filter((b) => b.id !== movingId)
    .reduce((acc, b) => {
      const { h } = spansForPreset(b.styles?.widthPreset);
      const y = Math.max(0, (sourceLayouts[b.id] ?? b.layout)?.y ?? 0);
      return Math.max(acc, y + h);
    }, 0);
}

export function computeTargetFromOver(
  overId: string,
  movingW: number,
  movingPreset: BlockWidthPreset | undefined,
  blocks: Block[],
): GridLayout | null {
  const movingIsSkinny = isSkinny(movingPreset);

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

  if (overId.startsWith("cellHalf:")) {
    const parts = overId.split(":");
    const x = Number(parts[1]);
    const y = Number(parts[2]);
    const slot = Number(parts[3]);
    if (!Number.isNaN(x) && !Number.isNaN(y) && (slot === 0 || slot === 1)) {
      return movingIsSkinny
        ? {
            x: clamp(x, 0, 4 - movingW),
            y: Math.max(0, y),
            slot: slot as 0 | 1,
          }
        : {
            x: clamp(x, 0, 4 - movingW),
            y: Math.max(0, y),
          };
    }
  }

  if (overId.startsWith("block:")) {
    const id = overId.replace("block:", "");
    const b = blocks.find((x) => x.id === id);
    if (b) {
      const r = rectForBlock(b);
      return {
        x: clamp(r.x, 0, 4 - movingW),
        y: Math.max(0, r.y),
        ...(b.styles?.widthPreset === "skinnyTall" &&
        b.layout?.slot !== undefined
          ? { slot: b.layout.slot }
          : {}),
      };
    }
  }

  return null;
}

export function computePushedLayouts(
  movingId: string,
  target: GridLayout,
  blocks: Block[],
  sourceLayouts: LayoutById,
): Record<string, GridLayout> | null {
  const movingBlock = blocks.find((b) => b.id === movingId);
  if (!movingBlock) return null;

  const movingPreset = movingBlock.styles?.widthPreset;
  const movingSpans = spansForPreset(movingPreset);
  const anchored: GridLayout = {
    x: clamp(target.x, 0, 4 - movingSpans.w),
    y: Math.max(0, target.y),
    ...(isSkinny(movingPreset) ? { slot: target.slot ?? 0 } : {}),
  };

  const anchoredYUnits = yUnitsFor(anchored, movingPreset);
  const anchoredHUnits = hUnitsFor(movingPreset);

  const placed: PlacedRect[] = [
    {
      id: movingId,
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

    for (let y = 0; y < 200; y += yStep) {
      for (let x = 0; x <= 4 - w; x++) {
        const candidate = { x, y, w, h: hUnits };
        if (isFree(candidate)) return { x, y };
      }
    }

    return { x: 0, y: 0 };
  };

  const others = blocks
    .filter((b) => b.id !== movingId)
    .slice()
    .sort((a, b) => {
      const aPreset = a.styles?.widthPreset;
      const bPreset = b.styles?.widthPreset;
      const ay = yUnitsFor(sourceLayouts[a.id] ?? a.layout, aPreset);
      const by = yUnitsFor(sourceLayouts[b.id] ?? b.layout, bPreset);
      if (ay !== by) return ay - by;
      const ax = (sourceLayouts[a.id] ?? a.layout)?.x ?? 0;
      const bx = (sourceLayouts[b.id] ?? b.layout)?.x ?? 0;
      return ax - bx;
    });

  const nextLayouts: Record<string, GridLayout> = {
    [movingId]: anchored,
  };

  for (const other of others) {
    const otherPreset = other.styles?.widthPreset;
    const { w } = spansForPreset(otherPreset);
    const hUnits = hUnitsFor(otherPreset);
    const yStep = isSkinny(otherPreset) ? 1 : 2;
    const source = sourceLayouts[other.id] ?? other.layout;
    const originalX = clamp(source?.x ?? 0, 0, 4 - w);
    const originalYUnits = yUnitsFor(source, otherPreset);
    const alignedOriginalYUnits = isSkinny(otherPreset)
      ? originalYUnits
      : originalYUnits - (originalYUnits % 2);
    const originalRect = { x: originalX, y: originalYUnits, w, h: hUnits };

    const collides = placed.some((p) => overlaps(originalRect, p));
    const finalPos = collides
      ? findSpotNear(originalX, alignedOriginalYUnits, w, hUnits, yStep)
      : { x: originalX, y: originalYUnits };

    placed.push({ id: other.id, x: finalPos.x, y: finalPos.y, w, h: hUnits });

    if (isSkinny(otherPreset)) {
      nextLayouts[other.id] = {
        x: finalPos.x,
        y: Math.floor(finalPos.y / 2),
        slot: (finalPos.y % 2) as 0 | 1,
      };
    } else {
      nextLayouts[other.id] = {
        x: finalPos.x,
        y: Math.floor(finalPos.y / 2),
      };
    }
  }

  return nextLayouts;
}
