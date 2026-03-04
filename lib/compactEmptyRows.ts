import type { Block } from "@/types/editor";
import type { CompactResult, GridConfig } from "@/types/grid";
import { DESKTOP_GRID, spansForBlock } from "@/lib/blockGrid";

/**
 * Compacts the layout by removing *fully empty* grid rows (rows where no block
 * covers any cell). This prevents gaps like y=0, y=3 which render as blank rows.
 */
export function compactEmptyRows(
  blocks: Block[],
  config: GridConfig = DESKTOP_GRID,
): CompactResult {
  if (blocks.length === 0) return { blocks, changedIds: new Set() };

  const rects = blocks.map((b) => {
    const { h } = spansForBlock(b, undefined, config);
    const y = Math.max(0, b.layout?.y ?? 0);
    return {
      id: b.id,
      ySub: Math.round(y * config.rowScale),
      hSub: Math.max(1, Math.round(h * config.rowScale)),
    };
  });

  const maxBottomSub = rects.reduce(
    (acc, r) => Math.max(acc, r.ySub + r.hSub),
    0,
  );
  if (maxBottomSub <= 0) return { blocks, changedIds: new Set() };

  const covered = Array.from({ length: maxBottomSub }, () => false);
  for (const r of rects) {
    for (
      let ySub = r.ySub;
      ySub < r.ySub + r.hSub && ySub < covered.length;
      ySub++
    ) {
      covered[ySub] = true;
    }
  }

  const hasAnyBlank = covered.some((c) => !c);
  if (!hasAnyBlank) return { blocks, changedIds: new Set() };

  const blanksBeforeRow = new Array<number>(maxBottomSub + 1);
  let blanks = 0;
  blanksBeforeRow[0] = 0;
  for (let ySub = 0; ySub < maxBottomSub; ySub++) {
    if (!covered[ySub]) blanks++;
    blanksBeforeRow[ySub + 1] = blanks;
  }

  const changedIds = new Set<string>();
  const nextBlocks = blocks.map((b) => {
    const currentYSub = Math.round(
      Math.max(0, b.layout?.y ?? 0) * config.rowScale,
    );
    const shiftSub = blanksBeforeRow[Math.min(currentYSub, maxBottomSub)] ?? 0;
    const nextYSub = Math.max(0, currentYSub - shiftSub);
    const nextY = nextYSub / config.rowScale;

    if (!b.layout) return b;
    if (nextY === b.layout.y) return b;
    changedIds.add(b.id);
    return {
      ...b,
      layout: {
        ...b.layout,
        y: nextY,
      },
    };
  });

  return { blocks: nextBlocks, changedIds };
}
