import type { Block } from "@/types/editor";
import type { GridConfig } from "@/types/grid";

export type BlockCanvasRenderMode = "desktop" | "mobile";

export type BlockDimensions = {
  widthPx: number;
  heightPx: number;
};

export type BlockCanvasProps =
  | { editable: true }
  | {
      editable: false;
      blocks: Block[];
      renderMode: BlockCanvasRenderMode;
      title?: string;
    };

export type SortableBlockProps = {
  block: Block;
  dimensions: BlockDimensions;
  fluid?: boolean;
  gridConfig?: GridConfig;
};
