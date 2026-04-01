import type { Layout } from "react-grid-layout";
import type { Block } from "@/types/editor";
import type { GridConfig } from "@/types/grid";
import { spansForBlock } from "@/lib/editor-engine/grid/grid-math";

export function blockToRglItem(block: Block, config: GridConfig): Layout {
  const { w, h } = spansForBlock(block, undefined, config);
  const x = block.layout?.x ?? 0;
  const y = block.layout?.y ?? 0;

  return {
    i: block.id,
    x,
    y: Math.round(y * config.rowScale),
    w,
    h: Math.max(1, Math.round(h * config.rowScale)),
    isResizable: false,
  };
}
