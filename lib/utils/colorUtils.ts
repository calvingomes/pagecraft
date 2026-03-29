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
 * Derives a legible text color from a hex background.
 * - Dark bg → very light tinted version of the color (mix with white at 88%)
 * - Light bg → very dark tinted version of the color (scale down to 14%)
 * Falls back to white for non-parseable inputs (CSS vars, 'transparent', etc.)
 */
export function deriveTextColor(bgColor: string): string {
  const rgb = hexToRgb(bgColor);
  if (!rgb) return "var(--color-white)";

  const lum = relativeLuminance(rgb.r, rgb.g, rgb.b);

  if (lum > 0.35) {
    // Light background → darken towards the hue
    const f = 0.14;
    return `rgb(${Math.round(rgb.r * f)}, ${Math.round(rgb.g * f)}, ${Math.round(rgb.b * f)})`;
  } else {
    // Dark background → lighten towards the hue
    const f = 0.88;
    return `rgb(${Math.round(rgb.r + (255 - rgb.r) * f)}, ${Math.round(rgb.g + (255 - rgb.g) * f)}, ${Math.round(rgb.b + (255 - rgb.b) * f)})`;
  }
}
