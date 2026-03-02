import type { SidebarPosition } from "@/types/page";

export type ProfileSidebarProps = (
  | {
      variant: "editor";
      displayName?: string;
      bioHtml?: string;
      onChangeDisplayName?: (displayName: string) => void;
      onChangeBioHtml?: (bioHtml: string) => void;
    }
  | {
      variant: "view";
      username: string;
      displayName?: string;
      bioHtml?: string;
    }
) & { position?: SidebarPosition };
