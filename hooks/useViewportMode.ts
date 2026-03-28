"use client";

import { useEffect, useState } from "react";
import {
  DESKTOP_MIN_WIDTH,
  MOBILE_MAX_WIDTH,
  TABLET_MAX_WIDTH,
  TABLET_MIN_WIDTH,
  resolveViewportMode,
} from "@/lib/editor-engine/data/viewport";
import type { ViewportMode } from "@/types/page";

export function useViewportMode(initialMode: ViewportMode = "desktop") {
  const [viewportMode, setViewportMode] = useState<ViewportMode>(initialMode);
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mobileMedia = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
    const tabletMedia = window.matchMedia(
      `(min-width: ${TABLET_MIN_WIDTH}px) and (max-width: ${TABLET_MAX_WIDTH}px)`,
    );
    const desktopMedia = window.matchMedia(
      `(min-width: ${DESKTOP_MIN_WIDTH}px)`,
    );

    const getWidth = () => {
      return window.visualViewport?.width ?? window.innerWidth;
    };

    const applyMode = () => {
      if (desktopMedia.matches) {
        setViewportMode("desktop");
      } else if (tabletMedia.matches) {
        setViewportMode("tablet");
      } else if (mobileMedia.matches) {
        setViewportMode("mobile");
      } else {
        setViewportMode(resolveViewportMode(getWidth()));
      }

      setIsResolved(true);
    };

    let rafId = 0;
    const update = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        applyMode();
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.visualViewport?.addEventListener("resize", update);

    if (typeof mobileMedia.addEventListener === "function") {
      mobileMedia.addEventListener("change", update);
      tabletMedia.addEventListener("change", update);
      desktopMedia.addEventListener("change", update);
    } else {
      mobileMedia.addListener(update);
      tabletMedia.addListener(update);
      desktopMedia.addListener(update);
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.visualViewport?.removeEventListener("resize", update);

      if (typeof mobileMedia.removeEventListener === "function") {
        mobileMedia.removeEventListener("change", update);
        tabletMedia.removeEventListener("change", update);
        desktopMedia.removeEventListener("change", update);
      } else {
        mobileMedia.removeListener(update);
        tabletMedia.removeListener(update);
        desktopMedia.removeListener(update);
      }
    };
  }, []);

  return { viewportMode, isResolved };
}
