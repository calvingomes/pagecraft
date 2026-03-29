import type { AvatarShape } from "@/types/page";

export type AvatarHoverToolbarProps = {
  visible: boolean;
  currentShape: AvatarShape;
  onDelete: () => void;
  onShapeChange: (shape: AvatarShape) => void;
  onUpload: (imageDataUrl: string) => void;
  className?: string;
};