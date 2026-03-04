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

  const preset = overridePreset ?? block.styles?.widthPreset;
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

  const preset = block.styles?.widthPreset;
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

// ── Placement helpers ───────────────────────────────────────────────

export function canPlaceBlockAt(
  block: Block,
  at: GridLayout,
  placed: Block[],
  config: GridConfig = DESKTOP_GRID,
): boolean {
  const rect = rectForBlock(block, at, config);
  if (rect.x < 0 || rect.y < 0) return false;
  if (rect.x + rect.w > config.cols) return false;
  return !placed.some((p) =>
    overlaps(rect, rectForBlock(p, undefined, config)),
  );
}

export function findFirstFreeSpot(
  block: Block,
  placed: Block[],
  config: GridConfig = DESKTOP_GRID,
): GridLayout {
  const { w, h } = spansForBlock(block, undefined, config);
  const maxPlacedBottom = placed.reduce((acc, p) => {
    const r = rectForBlock(p, undefined, config);
    return Math.max(acc, r.y + r.h);
  }, 0);
  const scanLimit = Math.max(200, Math.ceil(maxPlacedBottom) + 60);

  for (let y = 0; y < scanLimit; y += 1 / config.rowScale) {
    for (let x = 0; x <= config.cols - w; x++) {
      const rect: GridRect = { x, y, w, h };
      if (
        !placed.some((p) => overlaps(rect, rectForBlock(p, undefined, config)))
      ) {
        return { x, y };
      }
    }
  }
  return { x: 0, y: 0 };
}

// ── Collision resolution (shared by drag-and-drop and resize) ───────

/**
 * Given an anchored block placed at a target position, push all other blocks
 * out of the way so nothing overlaps. Returns a layout map for every block.
 */
export function resolveCollisions(
  anchoredId: string,
  anchoredLayout: GridLayout,
  anchoredPreset: BlockWidthPreset | undefined,
  allBlocks: Block[],
  getLayout: (block: Block) => GridLayout,
  config: GridConfig = DESKTOP_GRID,
): Record<string, GridLayout> {
  const anchoredBlock = allBlocks.find((b) => b.id === anchoredId);
  const { w: aw, h: ah } = anchoredBlock
    ? spansForBlock(anchoredBlock, anchoredPreset, config)
    : spansForPreset(anchoredPreset, config);
  const anchored: GridLayout = {
    x: clamp(anchoredLayout.x, 0, config.cols - aw),
    y: Math.max(0, anchoredLayout.y),
  };

  const placed: PlacedRect[] = [
    { id: anchoredId, x: anchored.x, y: anchored.y, w: aw, h: ah },
  ];

  const isFree = (candidate: Omit<PlacedRect, "id">) => {
    if (candidate.x < 0 || candidate.y < 0) return false;
    if (candidate.x + candidate.w > config.cols) return false;
    return !placed.some((p) => overlaps(candidate, p));
  };

  const findSpotNear = (
    startX: number,
    startY: number,
    w: number,
    h: number,
  ) => {
    const nx = clamp(startX, 0, config.cols - w);
    const ny = Math.max(0, startY);
    const xCandidates = Array.from(
      { length: config.cols - w + 1 },
      (_, i) => i,
    ).filter((cx) => cx !== nx);
    const orderedX = [nx, ...xCandidates];

    const maxExistingBottom = allBlocks.reduce((acc, block) => {
      const layout =
        block.id === anchoredId
          ? anchored
          : (getLayout(block) ?? block.layout ?? { x: 0, y: 0 });
      const rect = rectForBlock(block, layout, config);
      return Math.max(acc, rect.y + rect.h);
    }, anchored.y + ah);

    const scanLimit = Math.max(
      Math.ceil(maxExistingBottom) + 80,
      Math.ceil(ny) + 40,
    );

    for (let y = ny; y < scanLimit; y += 1 / config.rowScale) {
      for (const x of orderedX) {
        if (isFree({ x, y, w, h })) return { x, y };
      }
    }
    for (let y = 0; y < scanLimit; y += 1 / config.rowScale) {
      for (let x = 0; x <= config.cols - w; x++) {
        if (isFree({ x, y, w, h })) return { x, y };
      }
    }
    return { x: 0, y: 0 };
  };

  const others = allBlocks
    .filter((b) => b.id !== anchoredId)
    .slice()
    .sort((a, b) => {
      const al = getLayout(a);
      const bl = getLayout(b);
      return al.y !== bl.y ? al.y - bl.y : al.x - bl.x;
    });

  const result: Record<string, GridLayout> = { [anchoredId]: anchored };

  for (const other of others) {
    const { w, h } = spansForBlock(other, undefined, config);
    const pos = getLayout(other);
    const ox = clamp(pos.x, 0, config.cols - w);
    const oy = Math.max(0, pos.y);
    const rect = { x: ox, y: oy, w, h };

    const collides = placed.some((p) => overlaps(rect, p));
    const final = collides ? findSpotNear(ox, oy, w, h) : { x: ox, y: oy };

    placed.push({ id: other.id, x: final.x, y: final.y, w, h });
    result[other.id] = final;
  }

  return result;
}
