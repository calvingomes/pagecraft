export type BlockType = "text" | "link" | "image" | "sectionTitle";
export type BlockViewportMode = "desktop" | "mobile";

export type BlockWidthPreset =
  | "small" // 200x200
  | "large" // 420x420
  | "tall" // 200x420
  | "wide" // 420x200
  | "skinnyWide" // 420x90
  | "max" // 875x200
  | "full"; // 875x100

interface BaseBlock {
  id: string;
  order: number;
  updated_at?: string;
  styles?: {
    width?: number;
    height?: number;
    widthPreset?: BlockWidthPreset;
    transparentWrapper?: boolean;
    backgroundColor?: string;
  };
  // Desktop fallback/default placement
  layout?: {
    x: number;
    y: number;
  };
  mobileStyles?: {
    width?: number;
    height?: number;
    widthPreset?: BlockWidthPreset;
    transparentWrapper?: boolean;
    backgroundColor?: string;
  };
  mobileLayout?: {
    x: number;
    y: number;
  };
  visibility?: {
    desktop?: boolean;
    mobile?: boolean;
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
  content: { url: string; alt?: string; caption?: string; linkUrl?: string };
}

export interface SectionTitleBlock extends BaseBlock {
  type: "sectionTitle";
  content: { title: string };
}

export type Block = TextBlock | LinkBlock | ImageBlock | SectionTitleBlock;

export type LinkMetadataResponse = {
  title: string | null;
  imageUrl: string | null;
  iconUrl: string | null;
};

export type EditorContextValue = {
  username: string | null;
  selectedBlockId: string | null;
  focusedBlockId: string | null;
  onUpdateBlock: (id: string, updates: Partial<Block>) => Promise<void>;
  onRemoveBlock: (id: string) => Promise<void>;
  onSelectBlock: (id: string | null) => void;
  onFocusBlock: (id: string | null) => void;
  isActualMobile: boolean;
};

export type EditorState = {
  blocks: Block[];
  activeViewportMode: BlockViewportMode;
  selectedBlockId: string | null;
  focusedBlockId: string | null;
  isActualMobile: boolean;

  addBlock: (block: Block) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  selectBlock: (id: string | null) => void;
  focusBlock: (id: string | null) => void;
  setAllBlocks: (blocks: Block[]) => void;
  setActiveViewportMode: (mode: BlockViewportMode) => void;
  setIsActualMobile: (val: boolean) => void;
};
