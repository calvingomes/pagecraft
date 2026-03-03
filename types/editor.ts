export type BlockType = "text" | "link" | "image";

export type BlockWidthPreset =
  | "small" // 200x200
  | "large" // 420x420
  | "tall" // 200x420
  | "wide"; // 420x200

interface BaseBlock {
  id: string;
  order: number;
  styles?: {
    width?: number;
    height?: number;
    widthPreset?: BlockWidthPreset;
  };
  // Fixed grid position (independent of block order). Measured in 4-column
  // grid cells. (0-based)
  layout?: {
    x: number;
    y: number;
  };
}

export interface TextBlock extends BaseBlock {
  type: "text";
  content: { text: string };
}

export interface LinkBlock extends BaseBlock {
  type: "link";
  content: {
    url: string;
    title?: string;
    metaUrl?: string;
    metaTitle?: string;
    imageUrl?: string;
    iconUrl?: string;
    metaImageRemoved?: boolean;
  };
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  content: { url: string; alt?: string };
}

export type Block = TextBlock | LinkBlock | ImageBlock;
