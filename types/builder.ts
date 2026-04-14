import type { 
  Block, 
  BlockType, 
  BlockWidthPreset,
  TextBlock as TextBlockType,
  LinkBlock as LinkBlockType,
  ImageBlock as ImageBlockType,
  SectionTitleBlock as SectionTitleBlockType,
  MapBlock as MapBlockType,
} from "@/types/editor";
import type { GridConfig } from "@/types/grid";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type BlockCanvasRenderMode = "desktop" | "mobile";

export type BlockDimensions = {
  widthPx: number;
  heightPx: number;
};

export type BlockCanvasProps =
  | { editable: true }
  | {
      editable: false;
      blocks: Block[];
      renderMode: BlockCanvasRenderMode;
      title?: string;
    };

export type SortableBlockProps = {
  block: Block;
  dimensions: BlockDimensions;
  fluid?: boolean;
  gridConfig?: GridConfig;
};

export interface BlockRendererProps {
  block: Block;
  isMapUnlocked?: boolean;
  gridConfig?: GridConfig;
}

export interface ActionComponentProps {
  blockId: string;
  blockType: string;
  currentBackgroundColor?: string;
  isTransparentBackground?: boolean;
  onBackgroundColorChange?: (color: string | null) => void;
  isUnlocked: boolean;
  onUnlock?: () => void;
  onPaletteOpenChange?: (open: boolean) => void;
  onPaletteHoverChange?: (hovering: boolean) => void;
}

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
  onUnlock?: () => void;
  isUnlocked?: boolean;
};

export type BlockHoverToolbarIcons = {
  preset: BlockWidthPreset;
  title: string;
  Icon: LucideIcon;
  iconSize: number;
};

/**
 * Props for the Appearance (color/transparency) action component.
 */
export interface AppearanceActionsProps {
  blockType: BlockType;
  currentBackgroundColor?: string;
  isTransparentBackground?: boolean;
  onBackgroundColorChange: (color: string | null) => void;
  onPaletteOpenChange?: (open: boolean) => void;
  onPaletteHoverChange?: (hover: boolean) => void;
}

/**
 * Props for the Map-specific action component.
 */
export interface MapActionsProps {
  blockId: string;
  isUnlocked: boolean;
  onUnlock: () => void;
  onPaletteOpenChange?: (open: boolean) => void;
  onPaletteHoverChange?: (hover: boolean) => void;
}

/**
 * Registry mapping for block types to their specific action components.
 */
export type ActionRegistryMapping = Record<string, React.ComponentType<ActionComponentProps>>;

/**
 * Registry mapping for block types to their renderer components.
 */
export type BlockRendererMap = {
  text: (props: { block: TextBlockType; gridConfig?: GridConfig }) => ReactNode;
  link: (props: { block: LinkBlockType; gridConfig?: GridConfig }) => ReactNode;
  image: (props: { block: ImageBlockType; gridConfig?: GridConfig }) => ReactNode;
  sectionTitle: (props: { block: SectionTitleBlockType; gridConfig?: GridConfig }) => ReactNode;
  map: (props: { block: MapBlockType; isMapUnlocked?: boolean; gridConfig?: GridConfig }) => ReactNode;
};
