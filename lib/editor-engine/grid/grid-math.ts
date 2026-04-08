import type { Block, BlockWidthPreset } from "@/types/editor";
import type { GridConfig, GridRect, GridLayout } from "@/types/grid";
import { DESKTOP_GRID } from "./grid-config";

// ── Preset → grid spans ─────────────────────────────────────────────
export function spansForPreset(
  preset: BlockWidthPreset | undefined,
  config: GridConfig = DESKTOP_GRID,
): {
  w: number;
  h: number;
} {
  let w: number;
  let h: number;

  switch (preset ?? "small") {
    case "max":
      w = 4;
      h = 1;
      break;
    case "skinnyWide":
      w = 2;
      h = 0.5;
      break;
    case "full":
      w = 4;
      h = 1;
      break;
    case "large":
      w = 2;
      h = 2;
      break;
    case "wide":
      w = 2;
      h = 1;
      break;
    case "tall":
      w = 1;
      h = 2;
      break;
    case "small":
    default:
      w = 1;
      h = 1;
      break;
  }

  return { w: Math.min(w, config.cols), h };
}

// ── Preset → pixel dimensions (derived from grid config) ────────────
export function sizePxForPreset(
  preset: BlockWidthPreset | undefined,
  config: GridConfig = DESKTOP_GRID,
): {
  widthPx: number;
  heightPx: number;
} {
  const { w, h } = spansForPreset(preset, config);
  const widthPx = w * config.cellPx + (w - 1) * config.gapXPx;
  // "full" uses half-height instead of a full grid row
  const heightPx =
    preset === "full"
      ? Math.round(config.cellPx / 2)
      : Math.round(h * config.cellPx + (h - 1) * config.gapYPx);
  return { widthPx, heightPx };
}

export function spansForBlock(
  block: Block,
  overridePreset?: BlockWidthPreset,
  config: GridConfig = DESKTOP_GRID,
): {
  w: number;
  h: number;
} {
  if (block.type === "sectionTitle") {
    return { w: config.cols, h: 0.5 };
  }

  const isMobile = config.cols <= 2;
  const preset =
    overridePreset ??
    (isMobile
      ? (block.mobileStyles?.widthPreset ?? block.styles?.widthPreset)
      : block.styles?.widthPreset);

  return spansForPreset(preset, config);
}

export function sizePxForBlock(
  block: Block,
  config: GridConfig = DESKTOP_GRID,
): {
  widthPx: number;
  heightPx: number;
} {
  if (block.type === "sectionTitle") {
    return {
      widthPx: config.canvasPx,
      heightPx: config.subRowPx,
    };
  }

  const isMobile = config.cols <= 2;
  const preset = isMobile
    ? (block.mobileStyles?.widthPreset ?? block.styles?.widthPreset)
    : block.styles?.widthPreset;

  return sizePxForPreset(preset, config);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function overlaps(a: GridRect, b: GridRect): boolean {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

export function rectForBlock(
  block: Block,
  at?: GridLayout,
  config: GridConfig = DESKTOP_GRID,
): GridRect {
  const { w, h } = spansForBlock(block, undefined, config);
  const x = at?.x ?? block.layout?.x ?? 0;
  const y = at?.y ?? block.layout?.y ?? 0;
  return { x, y, w, h };
}

/**
 * Derives CSS absolute positioning from grid coordinates.
 * Used for "Lite" rendering without React-Grid-Layout.
 */
export function blockToStyle(
  block: Block,
  config: GridConfig = DESKTOP_GRID,
): React.CSSProperties {
  const { x, y, w, h } = rectForBlock(block, undefined, config);

  // w horizontal + (w-1) gaps
  const width = Math.round(w * config.cellPx + (Math.max(0, w - 1)) * config.gapXPx);
  // h vertical + (h-1) gaps
  const height = Math.round(h * config.cellPx + (Math.max(0, h - 1)) * config.gapYPx);

  const left = Math.round(x * (config.cellPx + config.gapXPx));
  const top = Math.round(y * (config.cellPx + config.gapYPx));

  return {
    position: "absolute",
    width: `${width}px`,
    height: `${height}px`,
    transform: `translate3d(${left}px, ${top}px, 0)`,
  };
}
