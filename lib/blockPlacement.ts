import type { Block, BlockWidthPreset } from "@/types/editor";
import type { GridLayout, GridRect } from "@/types/grid";
import { overlaps, spansForPreset } from "@/lib/blockGrid";

export function placementRectForBlock(block: Block, at?: GridLayout): GridRect {
  const { w, h } = spansForPreset(block.styles?.widthPreset);
  const x = at?.x ?? block.layout?.x ?? 0;
  const y = at?.y ?? block.layout?.y ?? 0;
  return { x, y, w, h };
}

export function canPlaceBlockAt(
  block: Block,
  at: GridLayout,
  placed: Block[],
): boolean {
  const rect = placementRectForBlock(block, at);
  if (rect.x < 0 || rect.y < 0) return false;
  if (rect.x + rect.w > 4) return false;

  return !placed.some((p) => overlaps(rect, placementRectForBlock(p)));
}

export function findFirstFreeSpot(block: Block, placed: Block[]): GridLayout {
  const preset = block.styles?.widthPreset;
  const { w, h } = spansForPreset(preset);

  for (let y = 0; y < 200; y++) {
    for (let x = 0; x <= 4 - w; x++) {
      const at: GridLayout = { x, y };
      const rect: GridRect = { x, y, w, h };
      if (rect.x < 0 || rect.y < 0) continue;
      if (rect.x + rect.w > 4) continue;

      const collides = placed.some((p) =>
        overlaps(rect, placementRectForBlock(p)),
      );
      if (!collides) return at;
    }
  }

  return { x: 0, y: 0 };
}
