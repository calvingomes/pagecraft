import type { Block } from "@/types/editor";
import type { GridConfig, LayoutById } from "@/types/grid";

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
  activeDragId?: string | null;
  fluid?: boolean;
  dndDisabled?: boolean;
  gridConfig?: GridConfig;
};

export type DesktopDndSnapshot = {
  layouts: LayoutById;
};

export type UseDesktopGridDndArgs = {
  editable: boolean;
  blocks: Block[];
  updateBlock: (id: string, updates: Partial<Block>) => void;
  onPersistBlockUpdate?: (
    id: string,
    updates: Partial<Block>,
  ) => void | Promise<void>;
};
