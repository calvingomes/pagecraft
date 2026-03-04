"use client";

import { useEffect, useMemo, useState } from "react";

export type ScreenView = "mobile" | "tablet" | "desktop";
export type PreviewView = "mobile" | "desktop";

const MOBILE_MAX = 959;
const TABLET_MAX = 1359;

function resolveScreenView(width: number): ScreenView {
  if (width < 960) return "mobile";
  if (width <= TABLET_MAX) return "tablet";
  return "desktop";
}

export function useEditorViewportPreview() {
  const [screenView, setScreenView] = useState<ScreenView>("desktop");
  const [overrideView, setOverrideView] = useState<PreviewView | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => setScreenView(resolveScreenView(window.innerWidth));
    update();

    const mobileMedia = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const tabletMedia = window.matchMedia(
      `(min-width: 960px) and (max-width: ${TABLET_MAX}px)`,
    );

    if (typeof mobileMedia.addEventListener === "function") {
      mobileMedia.addEventListener("change", update);
      tabletMedia.addEventListener("change", update);
      window.addEventListener("resize", update);

      return () => {
        mobileMedia.removeEventListener("change", update);
        tabletMedia.removeEventListener("change", update);
        window.removeEventListener("resize", update);
      };
    }

    mobileMedia.addListener(update);
    tabletMedia.addListener(update);
    window.addEventListener("resize", update);

    return () => {
      mobileMedia.removeListener(update);
      tabletMedia.removeListener(update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const autoPreviewView: PreviewView =
    screenView === "mobile" ? "mobile" : "desktop";

  const previewView = useMemo(
    () => overrideView ?? autoPreviewView,
    [overrideView, autoPreviewView],
  );

  return {
    screenView,
    previewView,
    setPreviewView: setOverrideView,
    clearPreviewOverride: () => setOverrideView(null),
    isOverrideActive: overrideView !== null,
  };
}
