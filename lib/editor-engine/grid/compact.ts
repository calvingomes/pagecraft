import type { Block } from "@/types/editor";
import type { CompactResult, GridConfig } from "@/types/grid";
import { DESKTOP_GRID } from "./grid-config";
import { spansForBlock } from "./grid-math";

/**
 * Compacts the layout by removing *fully empty* grid rows (rows where no block
 * covers any cell). This prevents gaps like y=0, y=3 which render as blank rows.
 */
export function compactEmptyRows(
  blocks: Block[],
  config: GridConfig = DESKTOP_GRID,
): CompactResult {
  if (blocks.length === 0) return { blocks, changedIds: new Set() };

  type RectSub = { id: string; ySub: number; hSub: number; originalY: number };
  const rects: RectSub[] = [];

  for (const b of blocks) {
    const { h } = spansForBlock(b, undefined, config);
    const y = Math.max(0, b.layout?.y ?? 0);
    rects.push({
      id: b.id,
      ySub: Math.round(y * config.rowScale),
      hSub: Math.max(1, Math.round(h * config.rowScale)),
      originalY: b.layout?.y ?? 0,
    });
  }

  // Find max bottom
  const maxBottomSub = rects.reduce((acc, r) => Math.max(acc, r.ySub + r.hSub), 0);
  if (maxBottomSub <= 0) return { blocks, changedIds: new Set() };

  // Sweep coverage using fast TypedArrays
  const covered = new Uint8Array(maxBottomSub);
  for (const r of rects) {
    covered.fill(1, r.ySub, Math.min(r.ySub + r.hSub, maxBottomSub));
  }

  // Early exit if no blanks
  if (covered.indexOf(0) === -1) {
    return { blocks, changedIds: new Set() };
  }

  // Prefix sum of blanks
  const blanksBeforeRow = new Int32Array(maxBottomSub + 1);
  let blanks = 0;
  for (let ySub = 0; ySub < maxBottomSub; ySub++) {
    if (covered[ySub] === 0) blanks++;
    blanksBeforeRow[ySub + 1] = blanks;
  }

  const changedIds = new Set<string>();
  const shiftMap = new Map<string, number>();

  for (const r of rects) {
    const shiftSub = blanksBeforeRow[Math.min(r.ySub, maxBottomSub)];
    if (shiftSub > 0) {
      const nextYSub = Math.max(0, r.ySub - shiftSub);
      const nextY = nextYSub / config.rowScale;
      if (nextY !== r.originalY) {
        shiftMap.set(r.id, nextY);
        changedIds.add(r.id);
      }
    }
  }

  if (changedIds.size === 0) return { blocks, changedIds };

  const nextBlocks = blocks.map((b) => {
    const nextY = shiftMap.get(b.id);
    if (nextY !== undefined && b.layout) {
      return {
        ...b,
        layout: {
          ...b.layout,
          y: nextY,
        },
      };
    }
    return b;
  });

  return { blocks: nextBlocks, changedIds };
}
