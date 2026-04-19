import type { AvatarShape, PageBackgroundId, SidebarPosition, PreviewViewport } from "@/types/page";
import type { BlockType } from "@/types/editor";
import type { AddBlockOptions } from "@/components/builder/Toolbars/Toolbar.types";

export interface EditorLayoutProps {
  username: string | null;
  isSaving: boolean;
  background: PageBackgroundId;
  sidebarPosition: SidebarPosition;
  displayName: string;
  bioHtml: string;
  avatarUrl: string;
  avatarShape: AvatarShape;
  updatedAt?: string;
  setDisplayName: (val: string) => void;
  setBioHtml: (val: string) => void;
  setAvatarUrl: (val: string) => void;
  setAvatarShape: (val: AvatarShape) => void;
  setBackground: (val: PageBackgroundId) => void;
  setSidebarPosition: (val: SidebarPosition) => void;
  onAddBlock: (type: BlockType, options?: AddBlockOptions) => Promise<void>;
  onSave: () => Promise<void>;
  onOpenSettings: () => void;
  onLogout: () => Promise<void>;
  
  // Desktop only
  previewView?: PreviewViewport;
  setPreviewView?: (view: PreviewViewport) => void;
  isDesktopEditing?: boolean;
}
