function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "").slice(0, 6);
  if (clean.length !== 6) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function relativeLuminance(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * Resolves a CSS variable or hex string to an RGB object.
 * In a real browser environment, we'd use getComputedStyle.
 * Here we provide a simple mapping for our predefined palette.
 */
const COLOR_MAP: Record<string, string> = {
  "var(--color-block-bg-white)": "#ffffff",
  "var(--color-block-bg-light-grey)": "#f3f4f6",
  "var(--color-block-bg-sky)": "#7dd3fc",
  "var(--color-block-bg-blue)": "#3b82f6",
  "var(--color-block-bg-indigo)": "#4f46e5",
  "var(--color-block-bg-yellow)": "#fde047",
  "var(--color-block-bg-orange)": "#f97316",
  "var(--color-block-bg-red)": "#ef4444",
  "var(--color-block-bg-dark-grey)": "#4b5563",
  "var(--color-block-bg-black)": "#000000",
  "var(--color-block-bg-lavender)": "#e0e7ff",
  "var(--color-block-bg-purple)": "#a855f7",
  "var(--color-block-bg-pink)": "#ec4899",
  "var(--color-block-bg-mint)": "#ccfbf1",
  "var(--color-block-bg-green)": "#22c55e",
  "var(--color-block-bg-dark-green)": "#14532d",
  // Page Backgrounds
  "var(--color-editor-page-bg-1)": "#e8e8e6",
  "var(--color-editor-page-bg-2)": "#f4f9f2",
  "var(--color-editor-page-bg-3)": "#fefce8",
  "var(--color-editor-page-bg-4)": "#eff6ff",
  "var(--color-editor-page-bg-5)": "#fdf2ff",
  "var(--color-editor-page-bg-6)": "#fef2f2",
  "var(--color-editor-page-bg-7)": "#f5f3ff",
  "var(--color-editor-page-bg-8)": "#f0fdfa",
  "var(--color-editor-page-bg-9)": "#fff7ed",
  "var(--color-editor-page-bg-white)": "#ffffff",
};

export function deriveTextColor(bgColor: string): string {
  const hex = bgColor.startsWith("var") ? COLOR_MAP[bgColor] : bgColor;
  const rgb = hexToRgb(hex || "#ffffff");
  if (!rgb) return "var(--color-black)";

  const lum = relativeLuminance(rgb.r, rgb.g, rgb.b);
  // WCAG threshold for contrast is usually 0.5 for simple black/white decision
  return lum > 0.5 ? "var(--color-black)" : "var(--color-white)";
}
