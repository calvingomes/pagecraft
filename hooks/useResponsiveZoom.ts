import { useState, useRef, useEffect } from "react";

/**
 * A hook that calculates a CSS zoom value based on a target width
 * to prevent content from being cropped when the container is 
 * narrower than expected.
 * 
 * @param targetWidth The ideal width in pixels (e.g., 370 for mobile grid)
 * @param enabled Whether to activate the observer (defaults to true)
 */
export function useResponsiveZoom(targetWidth: number, enabled: boolean = true) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If disabled, reset zoom and do nothing
    if (!enabled) {
      requestAnimationFrame(() => setZoom(1));
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    // Separate function for readability and easy cleanup
    const handleResize = (width: number) => {
      if (!width) return;
      const nextZoom = width < targetWidth ? width / targetWidth : 1;
      setZoom(nextZoom);
    };

    // Initial check (useful for SSR/Hydration edge cases)
    requestAnimationFrame(() => {
      if (el) handleResize(el.getBoundingClientRect().width);
    });

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        handleResize(entries[0].contentRect.width);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [targetWidth, enabled]);

  return { containerRef, zoom };
}
