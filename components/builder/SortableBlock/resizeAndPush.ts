import type { Block, BlockWidthPreset } from "@/types/editor";
import { compactEmptyRows } from "@/lib/compactEmptyRows";
import { resolveCollisions } from "@/lib/blockGrid";

export function computeResizeAndPushUpdates(args: {
  targetBlock: Block;
  allBlocks: Block[];
  nextPreset: BlockWidthPreset;
}): Array<{ id: string; updates: Partial<Block> }> {
  const { targetBlock, allBlocks, nextPreset } = args;
  const currentLayout = targetBlock.layout ?? { x: 0, y: 0 };

  const nextLayouts = resolveCollisions(
    targetBlock.id,
    currentLayout,
    nextPreset,
    allBlocks,
    (b) => b.layout ?? { x: 0, y: 0 },
  );

  // Apply new layouts + preset change, then compact empty rows.
  const nextBlocks = allBlocks.map((b) => {
    const layout = nextLayouts[b.id];
    if (b.id === targetBlock.id) {
      return {
        ...b,
        styles: { ...b.styles, widthPreset: nextPreset },
        layout: layout ?? currentLayout,
      } as Block;
    }
    return layout ? ({ ...b, layout } as Block) : b;
  });

  const compacted = compactEmptyRows(nextBlocks);

  // Build update list (only blocks that actually changed).
  const updates: Array<{ id: string; updates: Partial<Block> }> = [];

  for (const next of compacted.blocks) {
    const prev = allBlocks.find((b) => b.id === next.id);
    if (!prev) continue;

    if (next.id === targetBlock.id) {
      const presetChanged =
        (prev.styles?.widthPreset ?? "small") !== nextPreset;
      const layoutChanged =
        prev.layout?.x !== next.layout?.x || prev.layout?.y !== next.layout?.y;

      if (presetChanged || layoutChanged) {
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

    if (
      prev.layout?.x !== next.layout?.x ||
      prev.layout?.y !== next.layout?.y
    ) {
      updates.push({ id: next.id, updates: { layout: next.layout } });
    }
  }

  return updates;
}
