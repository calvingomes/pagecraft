import type { BlockType, BlockWidthPreset } from "@/types/editor";
import type { LucideIcon } from "lucide-react";

export type BlockHoverToolbarProps = {
  blockId: string;
  blockType: BlockType;
  currentPreset?: BlockWidthPreset;
  onWidthChange: (preset: BlockWidthPreset) => void;
  visible?: boolean;
};

export type BlockHoverToolbarIcons = {
  preset: BlockWidthPreset;
  title: string;
  Icon: LucideIcon;
  iconSize: number;
};
