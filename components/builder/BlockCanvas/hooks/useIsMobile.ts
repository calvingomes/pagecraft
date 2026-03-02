"use client";

import { useEffect, useState } from "react";

export function useIsMobile(maxWidthPx = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(`(max-width: ${maxWidthPx}px)`);
    const update = () => setIsMobile(media.matches);
    update();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    // Safari < 14
    media.addListener(update);
    return () => media.removeListener(update);
  }, [maxWidthPx]);

  return isMobile;
}
