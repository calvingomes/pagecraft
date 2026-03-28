import type {
  PreviewViewport,
  SidebarPosition,
  ViewportMode,
} from "@/types/page";

export const MOBILE_MAX_WIDTH = 959;
export const TABLET_MIN_WIDTH = 960;
export const TABLET_MAX_WIDTH = 1359;
export const DESKTOP_MIN_WIDTH = 1360;

export function resolveViewportMode(width: number): ViewportMode {
  if (width <= MOBILE_MAX_WIDTH) return "mobile";
  if (width <= TABLET_MAX_WIDTH) return "tablet";
  return "desktop";
}

export function resolveViewportModeFromUserAgent(
  userAgent: string | null | undefined,
): ViewportMode {
  const value = (userAgent ?? "").toLowerCase();

  if (!value) {
    return "desktop";
  }

  const isTablet = /ipad|tablet|android(?!.*mobile)|kindle|silk/.test(value);
  if (isTablet) {
    return "tablet";
  }

  const isMobile =
    /mobile|iphone|ipod|android|blackberry|iemobile|opera mini/.test(value);
  if (isMobile) {
    return "mobile";
  }

  return "desktop";
}

export type EditorViewportCapabilities = {
  allowManualPreviewToggle: boolean;
  defaultPreviewViewport: PreviewViewport;
};

export function getEditorViewportCapabilities(
  mode: ViewportMode,
): EditorViewportCapabilities {
  if (mode === "mobile") {
    return {
      allowManualPreviewToggle: false,
      defaultPreviewViewport: "mobile",
    };
  }

  if (mode === "tablet") {
    return {
      allowManualPreviewToggle: true,
      defaultPreviewViewport: "desktop",
    };
  }

  return {
    allowManualPreviewToggle: true,
    defaultPreviewViewport: "desktop",
  };
}

export function getViewEffectiveSidebarPosition(
  mode: ViewportMode,
  persisted: SidebarPosition,
): SidebarPosition {
  if (mode === "tablet" || mode === "mobile") {
    return "center";
  }

  return persisted;
}
