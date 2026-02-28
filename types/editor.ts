export type BlockType = "text" | "link" | "image";

export type BlockWidthPreset = "narrow" | "medium" | "wide" | "full";

interface BaseBlock {
  id: string;
  order: number;
  styles?: {
    width?: number;
    height?: number;
    widthPreset?: BlockWidthPreset;
    // previous grid implementation used a break flag; now layout handles
    // explicit positioning so this field is no longer necessary.
  };
  /**
   * explicit grid coordinates used by react-grid-layout
   * x, y are zero-based grid positions; w, h are span counts
   */
  layout?: {
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    static?: boolean;
  };
}

export interface TextBlock extends BaseBlock {
  type: "text";
  content: { text: string };
}

export interface LinkBlock extends BaseBlock {
  type: "link";
  content: { url: string; label: string };
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  content: { url: string; alt?: string };
}

export type Block = TextBlock | LinkBlock | ImageBlock;
