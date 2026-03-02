import type { BlockType } from "@/types/editor";
import type { PageBackgroundId, SidebarPosition } from "@/types/page";

export type ToolbarMode = "default" | "link";

export type ToolbarDefaultProps = {
  onAddBlock?: (
    type: BlockType,
    options?: { url?: string; title?: string },
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
