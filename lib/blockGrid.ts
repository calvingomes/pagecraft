import type { Block, BlockWidthPreset } from "@/types/editor";
import type { GridLayout, GridRect, PlacedRect } from "@/types/grid";

// ── Grid constants (single source of truth) ──────────────────────────
export const GRID_COLS = 4;
export const GRID_CELL_PX = 200;
export const GRID_GAP_PX = 20;
export const GRID_CANVAS_PX =
  GRID_COLS * GRID_CELL_PX + (GRID_COLS - 1) * GRID_GAP_PX;

// ── Preset → grid spans ─────────────────────────────────────────────
export function spansForPreset(preset: BlockWidthPreset | undefined): {
  w: number;
  h: number;
} {
  switch (preset ?? "small") {
    case "full":
      return { w: 4, h: 1 };
    case "large":
      return { w: 2, h: 2 };
    case "wide":
      return { w: 2, h: 1 };
    case "tall":
      return { w: 1, h: 2 };
    case "small":
    default:
      return { w: 1, h: 1 };
  }
}

// ── Preset → pixel dimensions (derived from grid constants) ─────────
export function sizePxForPreset(preset: BlockWidthPreset | undefined): {
  widthPx: number;
  heightPx: number;
} {
  const { w, h } = spansForPreset(preset);
  const widthPx = w * GRID_CELL_PX + (w - 1) * GRID_GAP_PX;
  // "full" uses half-height (100 px) instead of a full grid row
  const heightPx =
    preset === "full" ? 100 : h * GRID_CELL_PX + (h - 1) * GRID_GAP_PX;
  return { widthPx, heightPx };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function overlaps(a: GridRect, b: GridRect): boolean {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

export function rectForBlock(block: Block, at?: GridLayout): GridRect {
  const { w, h } = spansForPreset(block.styles?.widthPreset);
  const x = at?.x ?? block.layout?.x ?? 0;
  const y = at?.y ?? block.layout?.y ?? 0;
  return { x, y, w, h };
}

// ── Placement helpers ───────────────────────────────────────────────

export function canPlaceBlockAt(
  block: Block,
  at: GridLayout,
  placed: Block[],
): boolean {
  const rect = rectForBlock(block, at);
  if (rect.x < 0 || rect.y < 0) return false;
  if (rect.x + rect.w > GRID_COLS) return false;
  return !placed.some((p) => overlaps(rect, rectForBlock(p)));
}

export function findFirstFreeSpot(block: Block, placed: Block[]): GridLayout {
  const { w, h } = spansForPreset(block.styles?.widthPreset);
  for (let y = 0; y < 200; y++) {
    for (let x = 0; x <= GRID_COLS - w; x++) {
      const rect: GridRect = { x, y, w, h };
      if (!placed.some((p) => overlaps(rect, rectForBlock(p)))) {
        return { x, y };
      }
    }
  }
  return { x: 0, y: 0 };
}

// ── Collision resolution (shared by drag-and-drop and resize) ───────

/**
 * Given an anchored block placed at a target position, push all other blocks
 * out of the way so nothing overlaps. Returns a layout map for every block.
 */
export function resolveCollisions(
  anchoredId: string,
  anchoredLayout: GridLayout,
  anchoredPreset: BlockWidthPreset | undefined,
  allBlocks: Block[],
  getLayout: (block: Block) => GridLayout,
): Record<string, GridLayout> {
  const { w: aw, h: ah } = spansForPreset(anchoredPreset);
  const anchored: GridLayout = {
    x: clamp(anchoredLayout.x, 0, GRID_COLS - aw),
    y: Math.max(0, anchoredLayout.y),
  };

  const placed: PlacedRect[] = [
    { id: anchoredId, x: anchored.x, y: anchored.y, w: aw, h: ah },
  ];

  const isFree = (candidate: Omit<PlacedRect, "id">) => {
    if (candidate.x < 0 || candidate.y < 0) return false;
    if (candidate.x + candidate.w > GRID_COLS) return false;
    return !placed.some((p) => overlaps(candidate, p));
  };

  const findSpotNear = (
    startX: number,
    startY: number,
    w: number,
    h: number,
  ) => {
    const nx = clamp(startX, 0, GRID_COLS - w);
    const ny = Math.max(0, startY);
    const xCandidates = Array.from(
      { length: GRID_COLS - w + 1 },
      (_, i) => i,
    ).filter((cx) => cx !== nx);
    const orderedX = [nx, ...xCandidates];

    for (let y = ny; y < 200; y++) {
      for (const x of orderedX) {
        if (isFree({ x, y, w, h })) return { x, y };
      }
    }
    for (let y = 0; y < 200; y++) {
      for (let x = 0; x <= GRID_COLS - w; x++) {
        if (isFree({ x, y, w, h })) return { x, y };
      }
    }
    return { x: 0, y: 0 };
  };

  const others = allBlocks
    .filter((b) => b.id !== anchoredId)
    .slice()
    .sort((a, b) => {
      const al = getLayout(a);
      const bl = getLayout(b);
      return al.y !== bl.y ? al.y - bl.y : al.x - bl.x;
    });

  const result: Record<string, GridLayout> = { [anchoredId]: anchored };

  for (const other of others) {
    const { w, h } = spansForPreset(other.styles?.widthPreset);
    const pos = getLayout(other);
    const ox = clamp(pos.x, 0, GRID_COLS - w);
    const oy = Math.max(0, pos.y);
    const rect = { x: ox, y: oy, w, h };

    const collides = placed.some((p) => overlaps(rect, p));
    const final = collides ? findSpotNear(ox, oy, w, h) : { x: ox, y: oy };

    placed.push({ id: other.id, x: final.x, y: final.y, w, h });
    result[other.id] = final;
  }

  return result;
}
