import { useState, useEffect, RefObject } from "react";

/**
 * Returns a 0-1 progress value based on the element's position relative to center of viewport
 * @param ref - Ref to the element to track
 * @param animStartOffset - 0-1 percentage from top where animation starts (default: 0.9 = 90% down)
 * @param animEndOffset - 0-1 percentage from top where animation ends (default: 0.3 = 30% down)
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  animStartOffset = 0.9,
  animEndOffset = 0.3
) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = ref.current;
      if (!el) return;

      const { top, height } = el.getBoundingClientRect();
      const sectionCenter = top + height / 2;

      const animStart = window.innerHeight * animStartOffset;
      const animEnd = window.innerHeight * animEndOffset;

      const currentProgress = Math.min(
        1,
        Math.max(0, (animStart - sectionCenter) / (animStart - animEnd))
      );

      setProgress(currentProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [ref, animStartOffset, animEndOffset]);

  return progress;
}
