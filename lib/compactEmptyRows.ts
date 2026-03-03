import type { Block } from "@/types/editor";
import type { CompactResult } from "@/types/grid";
import { spansForPreset } from "@/lib/blockGrid";

/**
 * Compacts the layout by removing *fully empty* grid rows (rows where no block
 * covers any cell). This prevents gaps like y=0, y=3 which render as blank rows.
 */
export function compactEmptyRows(blocks: Block[]): CompactResult {
  if (blocks.length === 0) return { blocks, changedIds: new Set() };

  const rects = blocks.map((b) => {
    const { h } = spansForPreset(b.styles?.widthPreset);
    const y = Math.max(0, b.layout?.y ?? 0);
    return { id: b.id, y, h };
  });

  const maxBottom = rects.reduce((acc, r) => Math.max(acc, r.y + r.h), 0);
  if (maxBottom <= 0) return { blocks, changedIds: new Set() };

  const covered = Array.from({ length: maxBottom }, () => false);
  for (const r of rects) {
    for (let y = r.y; y < r.y + r.h && y < covered.length; y++) {
      covered[y] = true;
    }
  }

  const hasAnyBlank = covered.some((c) => !c);
  if (!hasAnyBlank) return { blocks, changedIds: new Set() };

  const blanksBeforeRow = new Array<number>(maxBottom + 1);
  let blanks = 0;
  blanksBeforeRow[0] = 0;
  for (let y = 0; y < maxBottom; y++) {
    if (!covered[y]) blanks++;
    blanksBeforeRow[y + 1] = blanks;
  }

  const changedIds = new Set<string>();
  const nextBlocks = blocks.map((b) => {
    const currentY = Math.max(0, b.layout?.y ?? 0);
    const shift = blanksBeforeRow[Math.min(currentY, maxBottom)] ?? 0;
    const nextY = Math.max(0, currentY - shift);

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
