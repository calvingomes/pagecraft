export type BlockType = "text" | "link" | "image";

export type BlockWidthPreset =
  | "small" // 200x200
  | "large" // 420x420 (2x2 including gap)
  | "tall" // 200x420
  | "skinnyWide" // 420x100
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
    // For half-height blocks (currently `skinnyWide`), 0 = top, 1 = bottom.
    slot?: 0 | 1;
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
    // User-editable title shown on the card.
    title?: string;
    // Legacy field (older data) used as a fallback for title.
    label?: string;
    // Auto-fetched metadata (should not overwrite user edits).
    metaUrl?: string;
    metaTitle?: string;
    imageUrl?: string;
    iconUrl?: string;
  };
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  content: { url: string; alt?: string };
}

export type Block = TextBlock | LinkBlock | ImageBlock;
