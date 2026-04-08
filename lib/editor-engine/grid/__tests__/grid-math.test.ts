import { describe, it, expect } from "vitest";
import { 
  spansForPreset, 
  sizePxForPreset, 
  overlaps,
  clamp 
} from "../grid-math";
import { DESKTOP_GRID, MOBILE_GRID } from "../grid-config";

describe("grid-math", () => {
  describe("spansForPreset", () => {
    it("returns 1x1 for small preset by default", () => {
      const { w, h } = spansForPreset("small", DESKTOP_GRID);
      expect(w).toBe(1);
      expect(h).toBe(1);
    });

    it("returns correct spans for desktop 'wide' preset", () => {
      const { w, h } = spansForPreset("wide", DESKTOP_GRID);
      expect(w).toBe(2);
      expect(h).toBe(1);
    });

    it("returns correct spans for desktop 'max' preset", () => {
      const { w, h } = spansForPreset("max", DESKTOP_GRID);
      expect(w).toBe(4);
      expect(h).toBe(1);
    });

    it("clamps 'max' preset to mobile grid columns", () => {
      // MOBILE_GRID has 2 columns
      const { w, h } = spansForPreset("max", MOBILE_GRID);
      expect(w).toBe(2);
      expect(h).toBe(1);
    });

    it("handles skinnyWide half-row height", () => {
      const { w, h } = spansForPreset("skinnyWide", DESKTOP_GRID);
      expect(w).toBe(2);
      expect(h).toBe(0.5);
    });
  });

  describe("sizePxForPreset", () => {
    it("calculates correct pixel width for desktop small block", () => {
      // 1 * 175 + (1-1) * 35 = 175
      const { widthPx } = sizePxForPreset("small", DESKTOP_GRID);
      expect(widthPx).toBe(175);
    });

    it("calculates correct pixel width for desktop wide block", () => {
      // 2 * 175 + (2-1) * 35 = 350 + 35 = 385
      // Wait, let's check the math: width = w * cellPx + (w - 1) * gapXPx
      const { widthPx } = sizePxForPreset("wide", DESKTOP_GRID);
      expect(widthPx).toBe(385);
    });

    it("calculates correct pixel height for desktop large block", () => {
      // 2 * 175 + (2-1) * 35 = 385
      const { heightPx } = sizePxForPreset("large", DESKTOP_GRID);
      expect(heightPx).toBe(385);
    });

    it("handles 'full' preset special height logic", () => {
      // preset === "full" ? Math.round(config.cellPx / 2)
      const { heightPx } = sizePxForPreset("full", DESKTOP_GRID);
      expect(heightPx).toBe(Math.round(175 / 2));
    });
  });

  describe("overlaps", () => {
    it("returns true when rectangles overlap", () => {
      const a = { x: 0, y: 0, w: 2, h: 2 };
      const b = { x: 1, y: 1, w: 2, h: 2 };
      expect(overlaps(a, b)).toBe(true);
    });

    it("returns false when rectangles are adjacent but not overlapping", () => {
      const a = { x: 0, y: 0, w: 1, h: 1 };
      const b = { x: 1, y: 0, w: 1, h: 1 };
      expect(overlaps(a, b)).toBe(false);
    });

    it("returns false when rectangles are far apart", () => {
      const a = { x: 0, y: 0, w: 1, h: 1 };
      const b = { x: 10, y: 10, w: 1, h: 1 };
      expect(overlaps(a, b)).toBe(false);
    });
  });

  describe("clamp", () => {
    it("clamps value to upper bound", () => {
      expect(clamp(10, 0, 5)).toBe(5);
    });

    it("clamps value to lower bound", () => {
      expect(clamp(-5, 0, 5)).toBe(0);
    });

    it("returns value if within bounds", () => {
      expect(clamp(3, 0, 5)).toBe(3);
    });
  });
});
