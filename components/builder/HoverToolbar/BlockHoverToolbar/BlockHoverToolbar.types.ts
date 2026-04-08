import type { BlockType, BlockWidthPreset } from "@/types/editor";
import type { LucideIcon } from "lucide-react";

export type BlockHoverToolbarProps = {
  blockId: string;
  blockType: BlockType;
  currentPreset?: BlockWidthPreset;
  currentBackgroundColor?: string;
  isTransparentBackground?: boolean;
  onWidthChange: (preset: BlockWidthPreset) => void;
  onBackgroundColorChange?: (color: string | null) => void;
  onPaletteOpenChange?: (open: boolean) => void;
  onPaletteHoverChange?: (hovering: boolean) => void;
  visible?: boolean;
  viewport?: "desktop" | "mobile";
};

export type BlockHoverToolbarIcons = {
  preset: BlockWidthPreset;
  title: string;
  Icon: LucideIcon;
  iconSize: number;
};
