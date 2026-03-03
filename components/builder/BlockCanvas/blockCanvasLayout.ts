import type { Block } from "@/types/editor";
import type { GridLayout } from "@/types/grid";
import { clamp, GRID_COLS, resolveCollisions } from "@/lib/blockGrid";

export type LayoutById = Record<string, GridLayout | undefined>;

export function computeTargetFromOver(
  overId: string,
  movingW: number,
  blocks: Block[],
): GridLayout | null {
  if (overId.startsWith("cell:")) {
    const parts = overId.split(":");
    const x = Number(parts[1]);
    const y = Number(parts[2]);
    if (!Number.isNaN(x) && !Number.isNaN(y)) {
      return {
        x: clamp(x, 0, GRID_COLS - movingW),
        y: Math.max(0, y),
      };
    }
  }

  if (overId.startsWith("block:")) {
    const id = overId.replace("block:", "");
    const b = blocks.find((bl) => bl.id === id);
    if (b) {
      return {
        x: clamp(b.layout?.x ?? 0, 0, GRID_COLS - movingW),
        y: Math.max(0, b.layout?.y ?? 0),
      };
    }
  }

  return null;
}

export function computePushedLayouts(
  movingId: string,
  target: GridLayout,
  blocks: Block[],
  sourceLayouts: LayoutById,
): Record<string, GridLayout> | null {
  const movingBlock = blocks.find((b) => b.id === movingId);
  if (!movingBlock) return null;

  return resolveCollisions(
    movingId,
    target,
    movingBlock.styles?.widthPreset,
    blocks,
    (b) => sourceLayouts[b.id] ?? b.layout ?? { x: 0, y: 0 },
  );
}
