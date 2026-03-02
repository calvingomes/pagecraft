import type { Block } from "@/types/editor";

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
