"use client";

import { useMemo, useState } from "react";
import {
  canUseEditorAtWidth,
  getEditorViewportCapabilities,
} from "@/lib/editor-engine/data/viewport";
import { useViewportMode } from "@/hooks/useViewportMode";
import type { PreviewViewport } from "@/types/page";

export function useEditorViewportPreview() {
  const { viewportMode, viewportWidth, isResolved } = useViewportMode();
  const [overrideView, setOverrideView] = useState<PreviewViewport | null>(
    null,
  );
  const capabilities = getEditorViewportCapabilities(viewportMode);

  const effectiveOverrideView = capabilities.allowManualPreviewToggle
    ? overrideView
    : null;

  const autoPreviewView = capabilities.defaultPreviewViewport;

  const previewView = useMemo(
    () => effectiveOverrideView ?? autoPreviewView,
    [effectiveOverrideView, autoPreviewView],
  );

  return {
    screenView: viewportMode,
    canUseEditor:
      viewportWidth === null ? false : canUseEditorAtWidth(viewportWidth),
    previewView,
    setPreviewView: (next: PreviewViewport | null) => {
      if (!capabilities.allowManualPreviewToggle) return;
      setOverrideView(next);
    },
    clearPreviewOverride: () => setOverrideView(null),
    isOverrideActive: effectiveOverrideView !== null,
    canTogglePreview: capabilities.allowManualPreviewToggle,
    viewportResolved: isResolved,
  };
}
