export type BlockType = "text" | "link" | "image";

interface BaseBlock {
  id: string;
  order: number;
  styles?: {
    width?: number;
    height?: number;
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
