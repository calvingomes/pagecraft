import type {
  GridConfig,
} from "@/types/grid";

// ── Grid configurations (single source of truth) ────────────────────

export const DESKTOP_GRID: GridConfig = {
  cols: 4,
  cellPx: 175,
  gapXPx: 35,
  gapYPx: 35,
  canvasPx: 805,
  rowScale: 2,
  subRowPx: 70,
  subRowGapPx: 35,
};

export const MOBILE_GRID: GridConfig = {
  cols: 2,
  cellPx: 170,
  gapXPx: 30,
  gapYPx: 30,
  canvasPx: 370,
  rowScale: 2,
  subRowPx: 70,
  subRowGapPx: 30,
};
