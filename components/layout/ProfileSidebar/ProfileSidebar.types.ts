import type { AvatarShape, SidebarPosition } from "@/types/page";

export type AvatarToolbarProps = {
  visible: boolean;
  currentShape: AvatarShape;
  onDelete: () => void;
  onShapeChange: (shape: AvatarShape) => void;
  onUpload: (imageDataUrl: string) => void;
  className?: string;
};

export type ProfileSidebarProps = (
  | {
      variant: "editor";
      displayName?: string;
      bioHtml?: string;
      avatarUrl?: string;
      avatarShape?: AvatarShape;
      onChangeDisplayName?: (displayName: string) => void;
      onChangeBioHtml?: (bioHtml: string) => void;
      onChangeAvatarUrl?: (avatarUrl: string) => void;
      onChangeAvatarShape?: (avatarShape: AvatarShape) => void;
    }
  | {
      variant: "view";
      username: string;
      displayName?: string;
      bioHtml?: string;
      avatarUrl?: string;
      avatarShape?: AvatarShape;
    }
) & { position?: SidebarPosition };
