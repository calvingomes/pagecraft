import type { LucideIcon } from "lucide-react";
import type { BlockType } from "@/types/editor";
import type { AddBlockOptions } from "./Toolbar.types";

export interface Widget {
  id: BlockType | 'link' | 'email' | 'map';
  title: string;
  description: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export interface WidgetMenuProps {
  onAddBlock?: (type: BlockType, options?: AddBlockOptions) => void | Promise<void>;
  onOpenLink?: () => void;
  onImageClick?: () => void;
}
