import type { ReactNode } from "react";
import type {
  PageBackgroundId,
  PreviewViewport,
  SidebarPosition,
} from "@/types/page";

export type PageLayoutProps = {
  children: ReactNode;
  footer?: ReactNode;
  background?: PageBackgroundId;
  sidebarPosition?: SidebarPosition;
  previewViewport?: PreviewViewport;
  framedMobilePreview?: boolean;
  isEditor?: boolean;
};
