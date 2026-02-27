export type BlockType = "text" | "link" | "image";

export type Block = {
  id: string;
  type: BlockType;
  content: Record<string, any>;
  order: number;
  styles?: {
    width?: number;
    height?: number;
  };
};
