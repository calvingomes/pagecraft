import type { BlockType } from "@/types/editor";
import type { PageBackgroundId, SidebarPosition } from "@/types/page";

export type ToolbarMode = "default" | "link";

export type AddBlockOptions = {
  url?: string;
  title?: string;
  file?: File;
  alt?: string;
};

export type ToolbarDefaultProps = {
  onAddBlock?: (
    type: BlockType,
    options?: AddBlockOptions,
  ) => void | Promise<void>;
  onOpenLink?: () => void;
  onChangeBackground?: (background: PageBackgroundId) => void;
  onChangeSidebarPosition?: (position: SidebarPosition) => void;
  background?: PageBackgroundId;
  sidebarPosition?: SidebarPosition;
};

export type ToolbarLinkProps = {
  linkUrl: string;
  onChangeLinkUrl: (next: string) => void;
  onBack: () => void;
  onCreateLink: () => void | Promise<void>;
};

export type PageBackgroundOption = { id: PageBackgroundId; cssVar: string };

export type ToolbarPalatteProps = {
  isOpen: boolean;
  onChangeBackground?: (background: PageBackgroundId) => void;
  onChangeSidebarPosition?: (position: SidebarPosition) => void;
  background?: PageBackgroundId;
  sidebarPosition?: SidebarPosition;
};
