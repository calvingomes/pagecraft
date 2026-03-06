import type { Block, BlockWidthPreset } from "@/types/editor";
import type { GridConfig, GridRect, GridLayout } from "@/types/grid";
import { DESKTOP_GRID } from "../grid/grid-config";
import { clamp, rectForBlock, spansForBlock, spansForPreset } from "../grid/grid-math";
import { OccupancyGrid } from "../grid/occupancy";

// ── Placement helpers ───────────────────────────────────────────────

export function canPlaceBlockAt(
  block: Block,
  at: GridLayout,
  placed: Block[],
  config: GridConfig = DESKTOP_GRID,
): boolean {
  const rect = rectForBlock(block, at, config);
  const grid = new OccupancyGrid(config);
  
  for (const p of placed) {
    grid.mark(rectForBlock(p, undefined, config));
  }
  
  return grid.isFree(rect);
}

export function findFirstFreeSpot(
  block: Block,
  placed: Block[],
  config: GridConfig = DESKTOP_GRID,
): GridLayout {
  const { w, h } = spansForBlock(block, undefined, config);
  const grid = new OccupancyGrid(config);
  
  let maxPlacedBottom = 0;
  for (const p of placed) {
    const r = rectForBlock(p, undefined, config);
    grid.mark(r);
    maxPlacedBottom = Math.max(maxPlacedBottom, r.y + r.h);
  }

  const scanLimit = Math.max(200, Math.ceil(maxPlacedBottom) + 60);

  for (let y = 0; y < scanLimit; y += 1 / config.rowScale) {
    for (let x = 0; x <= config.cols - w; x++) {
      if (grid.isFree({ x, y, w, h })) {
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
  config: GridConfig = DESKTOP_GRID,
): Record<string, GridLayout> {
  // 1. Memoize blocks to avoid recomputing spans inside loops
  type CachedBlock = {
    id: string;
    w: number;
    h: number;
    ox: number; // original layout X
    oy: number; // original layout Y
  };

  let anchoredCached: CachedBlock | null = null;
  const others: CachedBlock[] = [];

  for (const b of allBlocks) {
    if (b.id === anchoredId) {
      const { w, h } = spansForBlock(b, anchoredPreset, config);
      anchoredCached = { id: b.id, w, h, ox: anchoredLayout.x, oy: anchoredLayout.y };
    } else {
      const { w, h } = spansForBlock(b, undefined, config);
      const pos = getLayout(b) ?? b.layout ?? { x: 0, y: 0 };
      others.push({ id: b.id, w, h, ox: pos.x, oy: pos.y });
    }
  }

  // Handle case where anchoredBlock might not be in allBlocks (new block dragging in)
  if (!anchoredCached) {
    const { w, h } = spansForPreset(anchoredPreset, config);
    anchoredCached = { id: anchoredId, w, h, ox: anchoredLayout.x, oy: anchoredLayout.y };
  }

  // 2. Setup occupancy and place anchored block
  const grid = new OccupancyGrid(config);
  const result: Record<string, GridLayout> = {};

  const ax = clamp(anchoredCached.ox, 0, config.cols - anchoredCached.w);
  const ay = Math.max(0, anchoredCached.oy);
  
  grid.mark({ x: ax, y: ay, w: anchoredCached.w, h: anchoredCached.h });
  result[anchoredCached.id] = { x: ax, y: ay };

  let maxPlacedBottom = ay + anchoredCached.h;

  // 3. Sort others by top-to-bottom, left-to-right
  others.sort((a, b) => {
    return a.oy !== b.oy ? a.oy - b.oy : a.ox - b.ox;
  });

  // 4. Place remaining blocks, pushing if necessary
  for (const other of others) {
    const ox = clamp(other.ox, 0, config.cols - other.w);
    const oy = Math.max(0, other.oy);
    const rect = { x: ox, y: oy, w: other.w, h: other.h };

    if (!grid.isFree(rect)) {
      // Find a near spot
      let placed = false;
      const scanLimit = Math.max(
        Math.ceil(maxPlacedBottom) + 80,
        Math.ceil(oy) + 40,
      );

      // Prefer dropping into an available cell on the original X axis
      const xCandidates = Array.from(
        { length: config.cols - other.w + 1 },
        (_, i) => i,
      ).filter((cx) => cx !== ox);
      const orderedX = [ox, ...xCandidates];

      // Scan Y downwards
      for (let y = oy; y < scanLimit && !placed; y += 1 / config.rowScale) {
        for (const x of orderedX) {
          if (grid.isFree({ x, y, w: other.w, h: other.h })) {
            rect.x = x;
            rect.y = y;
            placed = true;
            break;
          }
        }
      }

      // Fallback: Scan from 0 if somehow not placed (rare)
      if (!placed) {
        for (let y = 0; y < scanLimit && !placed; y += 1 / config.rowScale) {
          for (let x = 0; x <= config.cols - other.w; x++) {
            if (grid.isFree({ x, y, w: other.w, h: other.h })) {
              rect.x = x;
              rect.y = y;
              placed = true;
              break;
            }
          }
        }
      }
      // Extremely unlikely fallback
      if (!placed) {
        rect.x = 0;
        rect.y = 0;
      }
    }

    grid.mark(rect);
    maxPlacedBottom = Math.max(maxPlacedBottom, rect.y + rect.h);
    result[other.id] = { x: rect.x, y: rect.y };
  }

  return result;
}
