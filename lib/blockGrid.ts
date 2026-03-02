import type { Block, BlockWidthPreset } from "@/types/editor";
import type { GridLayout, GridRect } from "@/types/grid";

// Keep in sync with the visual gap used by the canvas grid.
const GRID_GAP_PX = 20;
// Keep in sync with the desktop canvas grid row height.
const GRID_CELL_PX = 200;

export function spansForPreset(preset: BlockWidthPreset | undefined): {
  w: number;
  h: number;
} {
  switch (preset ?? "small") {
    case "large":
      return { w: 2, h: 2 };
    case "wide":
      return { w: 2, h: 1 };
    case "skinnyWide":
      return { w: 2, h: 1 };
    case "tall":
      return { w: 1, h: 2 };
    case "small":
    default:
      return { w: 1, h: 1 };
  }
}

export function sizePxForPreset(preset: BlockWidthPreset | undefined): {
  widthPx: number;
  heightPx: number;
} {
  switch (preset ?? "small") {
    case "large":
      return { widthPx: 420, heightPx: 420 };
    case "wide":
      return { widthPx: 420, heightPx: 200 };
    case "tall":
      return { widthPx: 200, heightPx: 420 };
    case "skinnyWide":
      // `skinnyWide` blocks are half-height within a single 200px row.
      // Two stacked `skinnyWide` blocks should align with the grid gap between them.
      // Example with default tokens: (200 - 20) / 2 = 90px.
      return {
        widthPx: 420,
        heightPx: Math.max(0, (GRID_CELL_PX - GRID_GAP_PX) / 2),
      };
    case "small":
    default:
      return { widthPx: 200, heightPx: 200 };
  }
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
