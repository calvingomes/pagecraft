import type { Block } from "@/types/editor";
import type { LayoutById } from "@/types/grid";

export type BlockCanvasProps =
  | { editable: true }
  | { editable: false; blocks: Block[]; title?: string };

export type SortableBlockProps = {
  block: Block;
  activeDragId?: string | null;
  fluid?: boolean;
  dndDisabled?: boolean;
  toolbarAlwaysVisible?: boolean;
};

export type DesktopDndSnapshot = {
  layouts: LayoutById;
  lastTargetKey: string | null;
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
