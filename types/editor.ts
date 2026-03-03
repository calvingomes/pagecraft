export type BlockType =
  | "text"
  | "paragraph"
  | "link"
  | "image"
  | "sectionTitle";

export type BlockWidthPreset =
  | "small" // 200x200
  | "large" // 420x420
  | "tall" // 200x420
  | "wide" // 420x200
  | "full"; // 1060x100

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

export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
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
  content: { url: string; alt?: string; caption?: string };
}

export interface SectionTitleBlock extends BaseBlock {
  type: "sectionTitle";
  content: { title: string };
}

export type Block =
  | TextBlock
  | ParagraphBlock
  | LinkBlock
  | ImageBlock
  | SectionTitleBlock;

export type LinkMetadataResponse = {
  title: string | null;
  imageUrl: string | null;
  iconUrl: string | null;
};

export type EditorContextValue = {
  username: string | null;
  onUpdateBlock: (id: string, updates: Partial<Block>) => Promise<void>;
  onRemoveBlock: (id: string) => Promise<void>;
};

export type EditorState = {
  blocks: Block[];
  selectedBlockId: string | null;

  addBlock: (block: Block) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  selectBlock: (id: string | null) => void;
  setBlocks: (blocks: Block[]) => void;
};
