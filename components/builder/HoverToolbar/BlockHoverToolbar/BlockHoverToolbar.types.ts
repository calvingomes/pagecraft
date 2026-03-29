import type { BlockType, BlockWidthPreset } from "@/types/editor";
import type { LucideIcon } from "lucide-react";

export type BlockHoverToolbarProps = {
  blockId: string;
  blockType: BlockType;
  currentPreset?: BlockWidthPreset;
  currentTransparentWrapper?: boolean;
  onWidthChange: (preset: BlockWidthPreset) => void;
  onToggleWrapperBackground?: () => void;
  visible?: boolean;
  viewport?: "desktop" | "mobile";
};

export type BlockHoverToolbarIcons = {
  preset: BlockWidthPreset;
  title: string;
  Icon: LucideIcon;
  iconSize: number;
};
