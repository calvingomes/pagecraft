import type { Block } from "@/types/editor";
import { compactEmptyRows } from "@/lib/compactEmptyRows";
import { resolveCollisions } from "@/lib/blockGrid";

type BlockUpdate = {
  id: string;
  updates: Partial<Block>;
};

export function computeAutoHeightReflowUpdates(args: {
  anchorBlock: Block;
  nextHeight: number;
  allBlocks: Block[];
}): BlockUpdate[] {
  const { anchorBlock, nextHeight, allBlocks } = args;

  const withNextHeight = allBlocks.map((block) =>
    block.id === anchorBlock.id
      ? ({
          ...block,
          styles: {
            ...block.styles,
            height: nextHeight,
          },
        } as Block)
      : block,
  );

  const pushedLayouts = resolveCollisions(
    anchorBlock.id,
    anchorBlock.layout ?? { x: 0, y: 0 },
    anchorBlock.styles?.widthPreset,
    withNextHeight,
    (block) => block.layout ?? { x: 0, y: 0 },
  );

  const laidOut = withNextHeight.map((block) =>
    pushedLayouts[block.id]
      ? ({ ...block, layout: pushedLayouts[block.id] } as Block)
      : block,
  );

  const compacted = compactEmptyRows(laidOut).blocks;
  const updates: BlockUpdate[] = [];

  for (const nextBlock of compacted) {
    const prevBlock = allBlocks.find((block) => block.id === nextBlock.id);
    if (!prevBlock) continue;

    if (nextBlock.id === anchorBlock.id) {
      updates.push({
        id: nextBlock.id,
        updates: {
          styles: {
            ...nextBlock.styles,
            height: nextHeight,
          },
          layout: nextBlock.layout,
        },
      });
      continue;
    }

    if (!nextBlock.layout) continue;
    const layoutChanged =
      prevBlock.layout?.x !== nextBlock.layout.x ||
      prevBlock.layout?.y !== nextBlock.layout.y;

    if (layoutChanged) {
      updates.push({
        id: nextBlock.id,
        updates: { layout: nextBlock.layout },
      });
    }
  }

  return updates;
}
