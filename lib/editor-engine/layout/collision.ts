import type { Block } from "@/types/editor";
import type { GridConfig, GridLayout } from "@/types/grid";
import { DESKTOP_GRID } from "../grid/grid-config";
import { rectForBlock, spansForBlock } from "../grid/grid-math";
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
