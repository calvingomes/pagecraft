import { describe, it, expect } from "vitest";
import { 
  spansForPreset, 
  sizePxForPreset, 
  spansForBlock, 
  rectForBlock, 
  blockToStyle 
} from "../grid-math";
import { DESKTOP_GRID, MOBILE_GRID } from "../grid-config";
import { Block } from "@/types/editor";

describe("grid-math", () => {
  describe("spansForPreset", () => {
    it("returns 1x1 for small on desktop", () => {
      expect(spansForPreset("small", DESKTOP_GRID)).toEqual({ w: 1, h: 1 });
    });

    it("returns 2x1 for wide on desktop", () => {
      expect(spansForPreset("wide", DESKTOP_GRID)).toEqual({ w: 2, h: 1 });
    });

    it("returns 4x1 for max on desktop", () => {
      expect(spansForPreset("max", DESKTOP_GRID)).toEqual({ w: 4, h: 1 });
    });

    it("clamps width to grid columns (e.g. 4 becomes 2 on mobile)", () => {
      expect(spansForPreset("max", MOBILE_GRID)).toEqual({ w: 2, h: 1 });
    });

    it("handles skinnyWide half-rows", () => {
      expect(spansForPreset("skinnyWide", DESKTOP_GRID)).toEqual({ w: 2, h: 0.5 });
    });

    it("handles full width preset with 1.0 height", () => {
      expect(spansForPreset("full", DESKTOP_GRID)).toEqual({ w: 4, h: 1 });
    });

    it("handles large preset", () => {
      expect(spansForPreset("large", DESKTOP_GRID)).toEqual({ w: 2, h: 2 });
    });

    it("handles tall preset", () => {
      expect(spansForPreset("tall", DESKTOP_GRID)).toEqual({ w: 1, h: 2 });
    });
  });

  describe("sizePxForPreset", () => {
    it("calculates pixel width/height including gaps", () => {
      const { widthPx, heightPx } = sizePxForPreset("wide", DESKTOP_GRID);
      // w=2: (2 * 175) + (1 * 35) = 385
      // h=1: (1 * 175) + (0 * 35) = 175
      expect(widthPx).toBe(385);
      expect(heightPx).toBe(175);
    });

    it("calculates special height for full width preset", () => {
      const { heightPx } = sizePxForPreset("full", DESKTOP_GRID);
      // Math.round(175 / 2) = 88
      expect(heightPx).toBe(88);
    });
  });

  describe("spansForBlock (Viewport Independence)", () => {
    const mockBlock: Partial<Block> = {
      id: "1",
      type: "text",
      styles: { widthPreset: "small" },
      mobileStyles: { widthPreset: "wide" }
    };

    it("uses desktop styles when config is DESKTOP_GRID", () => {
      const spans = spansForBlock(mockBlock as Block, undefined, DESKTOP_GRID);
      expect(spans.w).toBe(1);
    });

    it("uses mobile styles when config is MOBILE_GRID", () => {
      const spans = spansForBlock(mockBlock as Block, undefined, MOBILE_GRID);
      expect(spans.w).toBe(2);
    });

    it("falls back to desktop styles on mobile if mobileStyles is missing", () => {
      const noMobileBlock: Partial<Block> = {
        id: "2",
        type: "text",
        styles: { widthPreset: "small" }
      };
      const spans = spansForBlock(noMobileBlock as Block, undefined, MOBILE_GRID);
      expect(spans.w).toBe(1);
    });

    it("handles sectionTitle correctly on both viewports", () => {
      const section: Partial<Block> = { id: "s", type: "sectionTitle" };
      expect(spansForBlock(section as Block, undefined, DESKTOP_GRID)).toEqual({ w: 4, h: 0.5 });
      expect(spansForBlock(section as Block, undefined, MOBILE_GRID)).toEqual({ w: 2, h: 0.5 });
    });
  });

  describe("rectForBlock", () => {
    it("derives geometry from block layout and config", () => {
      const block: Partial<Block> = {
        id: "1",
        layout: { x: 2, y: 5 },
        styles: { widthPreset: "wide" }
      };
      const rect = rectForBlock(block as Block, undefined, DESKTOP_GRID);
      expect(rect).toEqual({ x: 2, y: 5, w: 2, h: 1 });
    });
  });

  describe("blockToStyle", () => {
    it("generates absolute positioning CSS with translate3d", () => {
      const block: Partial<Block> = {
        id: "1",
        layout: { x: 1, y: 1 },
        styles: { widthPreset: "small" }
      };
      const style = blockToStyle(block as Block, DESKTOP_GRID);
      
      expect(style.position).toBe("absolute");
      expect(style.width).toBe("175px");
      expect(style.transform).toBe("translate3d(210px, 210px, 0)"); // (1 * (175 + 35))
    });

    it("handles zero dimensions gracefully", () => {
      const block: Partial<Block> = {
        id: "z",
        layout: { x: 0, y: 0 },
        styles: { widthPreset: "small" }
      };
      // For width 1, h 1:
      // width = 1 * 175 + 0 * 35 = 175
      const style = blockToStyle(block as Block, DESKTOP_GRID);
      expect(style.width).toBe("175px");
    });
  });
});
