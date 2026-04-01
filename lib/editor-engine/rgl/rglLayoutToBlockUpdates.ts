import type { Layout } from "react-grid-layout";
import type { GridConfig } from "@/types/grid";

export function rglLayoutToBlockUpdates(
  newLayout: Layout[],
  snapshot: Record<string, { x: number; y: number }>,
  config: GridConfig,
): Array<{ id: string; x: number; y: number }> {
  return newLayout.flatMap((item) => {
    const previous = snapshot[item.i];

    if (!previous) return [];

    const logicalY = item.y / config.rowScale;
    if (previous.x === item.x && previous.y === logicalY) return [];

    return [{ id: item.i, x: item.x, y: logicalY }];
  });
}
