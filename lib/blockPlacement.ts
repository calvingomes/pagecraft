import type { Block, BlockWidthPreset } from "@/types/editor";
import type { GridLayout, GridRect } from "@/types/grid";
import { overlaps, spansForPreset } from "@/lib/blockGrid";

const isSkinny = (preset: BlockWidthPreset | undefined) =>
  preset === "skinnyWide";

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

export function placementRectForBlock(block: Block, at?: GridLayout): GridRect {
  const { w } = spansForPreset(block.styles?.widthPreset);
  const x = at?.x ?? block.layout?.x ?? 0;
  const y = yUnitsFor(at ?? block.layout, block.styles?.widthPreset);
  const h = hUnitsFor(block.styles?.widthPreset);
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
  const { w } = spansForPreset(preset);
  const hUnits = hUnitsFor(preset);
  const yStep = isSkinny(preset) ? 1 : 2;

  for (let yUnits = 0; yUnits < 200; yUnits += yStep) {
    for (let x = 0; x <= 4 - w; x++) {
      const y = Math.floor(yUnits / 2);
      const slot = isSkinny(preset) ? ((yUnits % 2) as 0 | 1) : undefined;

      const at: GridLayout = slot === undefined ? { x, y } : { x, y, slot };
      const rect: GridRect = { x, y: yUnits, w, h: hUnits };
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
