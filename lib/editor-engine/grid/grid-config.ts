import type { Block, BlockWidthPreset } from "@/types/editor";
import type {
  GridConfig,
  GridLayout,
  GridRect,
  PlacedRect,
} from "@/types/grid";

// ── Grid configurations (single source of truth) ────────────────────

export const DESKTOP_GRID: GridConfig = {
  cols: 4,
  cellPx: 200,
  gapXPx: 25,
  gapYPx: 25,
  canvasPx: 875,
  rowScale: 2,
  subRowPx: 90,
  subRowGapPx: 25,
};

export const MOBILE_GRID: GridConfig = {
  cols: 2,
  cellPx: 250,
  gapXPx: 40,
  gapYPx: 15,
  canvasPx: 540,
  rowScale: 2,
  subRowPx: 120,
  subRowGapPx: 15,
};
