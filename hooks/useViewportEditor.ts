"use client";

import { useEffect } from "react";
import { useEditorViewportPreview } from "@/hooks/useEditorViewportPreview";
import { useEditorStore } from "@/stores/editor-store";
import type { BlockViewportMode } from "@/types/editor";
import type { SidebarPosition } from "@/types/page";

export function useViewportEditor(desktopSidebarPosition: SidebarPosition) {
  const setIsActualMobile = useEditorStore((s) => s.setIsActualMobile);
  const setActiveViewportMode = useEditorStore((s) => s.setActiveViewportMode);

  const {
    screenView,
    previewView,
    setPreviewView,
    viewportResolved,
  } = useEditorViewportPreview();

  const isActualMobile = screenView === "mobile";

  // Side effect: sync "actual mobile" state to store
  useEffect(() => {
    setIsActualMobile(isActualMobile);
  }, [isActualMobile, setIsActualMobile]);

  const activeEditorMode =
    screenView === "mobile"
      ? "mobile"
      : previewView === "mobile"
        ? "mobile"
        : screenView === "tablet"
          ? "tablet"
          : "desktop";

  const activeBlockViewportMode: BlockViewportMode =
    previewView === "mobile" ? "mobile" : "desktop";

  // Side effect: sync active viewport mode to store
  useEffect(() => {
    setActiveViewportMode(activeBlockViewportMode);
  }, [activeBlockViewportMode, setActiveViewportMode]);

  const isDesktopEditing = activeEditorMode === "desktop";
  
  const effectiveSidebarPosition: SidebarPosition = isDesktopEditing
    ? desktopSidebarPosition
    : "center";

  return {
    screenView,
    previewView,
    setPreviewView,
    viewportResolved,
    isActualMobile,
    activeEditorMode,
    activeBlockViewportMode,
    isDesktopEditing,
    effectiveSidebarPosition,
  };
}
