import type { AvatarShape } from "@/types/page";

export type ProfileSidebarProps =
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
      updatedAt?: string;
    }
  | {
      variant: "view";
      username: string;
      displayName?: string;
      bioHtml?: string;
      avatarUrl?: string;
      avatarShape?: AvatarShape;
      updatedAt?: string;
    };
