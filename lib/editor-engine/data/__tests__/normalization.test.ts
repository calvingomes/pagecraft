import { describe, it, expect } from "vitest";
import { normalizeStoredBlocks, ensureBlocksHaveValidLayouts } from "../normalization";
import type { RawStoredBlock } from "../normalization";
import { DESKTOP_GRID, MOBILE_GRID } from "../../grid/grid-config";
import { Block } from "@/types/editor";

describe("normalization - Unified Block Model", () => {
  describe("normalizeStoredBlocks", () => {
    it("unpacks mobile data from styles JSONB correctly", () => {
      const raw = [
        {
          id: "b1",
          type: "text",
          styles: {
            backgroundColor: "#ff0000",
            mobileLayout: { x: 1, y: 1 },
            mobileStyles: { backgroundColor: "#0000ff" },
            visibility: { mobile: false }
          }
        }
      ];

      const normalized = normalizeStoredBlocks(raw as RawStoredBlock[]);
      const b1 = normalized[0];

      expect(b1.mobileLayout).toEqual({ x: 1, y: 1 });
      expect(b1.mobileStyles).toEqual({ backgroundColor: "#0000ff" });
      expect(b1.visibility).toEqual({ mobile: false });
      expect(b1.styles!.backgroundColor).toBe("#ff0000");
      
      // Ensure the moved properties are deleted from the styles object
      const stylesRecord = b1.styles as unknown as Record<string, unknown>;
      expect(stylesRecord.mobileLayout).toBeUndefined();
      expect(stylesRecord.mobileStyles).toBeUndefined();
      expect(stylesRecord.visibility).toBeUndefined();
    });

    it("handles clean data without nested parking", () => {
      const raw = [
        {
          id: "b1",
          type: "text",
          styles: { backgroundColor: "#ff0000" },
          mobileLayout: { x: 0, y: 0 },
          visibility: { desktop: true }
        }
      ];

      const normalized = normalizeStoredBlocks(raw as RawStoredBlock[]);
      expect(normalized[0].mobileLayout).toEqual({ x: 0, y: 0 });
      expect(normalized[0].visibility).toEqual({ desktop: true });
    });
  });

  describe("ensureBlocksHaveValidLayouts", () => {
    const defaultBlock: Partial<Block> = {
      type: "text",
      styles: { widthPreset: "small" },
      visibility: { desktop: true, mobile: true },
    };

    it("prevents overlapping blocks on desktop", () => {
      const blocks: Block[] = [
        { ...defaultBlock, id: "b1", layout: { x: 0, y: 0 }, order: 0 } as Block,
        { ...defaultBlock, id: "b2", layout: { x: 0, y: 0 }, order: 1 } as Block, // Overlaps b1
      ];

      const validated = ensureBlocksHaveValidLayouts(blocks, DESKTOP_GRID, "desktop");
      
      expect(validated[0].layout).toEqual({ x: 0, y: 0 });
      // b2 should have been moved to the next available spot (x: 1, y: 0)
      expect(validated[1].layout).toEqual({ x: 1, y: 0 });
    });

    it("prevents overlapping blocks on mobile", () => {
      const blocks: Block[] = [
        { ...defaultBlock, id: "b1", mobileLayout: { x: 0, y: 0 }, order: 0 } as Block,
        { ...defaultBlock, id: "b2", mobileLayout: { x: 0, y: 0 }, order: 1 } as Block, // Overlaps b1
      ];

      const validated = ensureBlocksHaveValidLayouts(blocks, MOBILE_GRID, "mobile");
      
      expect(validated[0].mobileLayout).toEqual({ x: 0, y: 0 });
      // b2 should move to (x:1, y:0)
      expect(validated[1].mobileLayout).toEqual({ x: 1, y: 0 });
    });

    it("ignores hidden blocks for collision detection", () => {
      const blocks: Block[] = [
        { 
          ...defaultBlock, 
          id: "b1", 
          layout: { x: 0, y: 0 }, 
          visibility: { desktop: false }, // HIDDEN
          order: 0 
        } as Block,
        { 
          ...defaultBlock, 
          id: "b2", 
          layout: { x: 0, y: 0 }, // Would overlap b1 if b1 were visible
          order: 1 
        } as Block,
      ];

      const validated = ensureBlocksHaveValidLayouts(blocks, DESKTOP_GRID, "desktop");
      
      // b1 keeps its layout but b2 is allowed to take (0,0) because b1 is hidden
      expect(validated[0].layout).toEqual({ x: 0, y: 0 });
      expect(validated[1].layout).toEqual({ x: 0, y: 0 });
    });

    it("fixes missing or invalid layouts", () => {
      const blocks: Block[] = [
        { ...defaultBlock, id: "b1", layout: undefined, order: 0 } as Block,
      ];

      const validated = ensureBlocksHaveValidLayouts(blocks, DESKTOP_GRID, "desktop");
      expect(validated[0].layout).toBeDefined();
      expect(validated[0].layout?.x).toBe(0);
      expect(validated[0].layout?.y).toBe(0);
    });
  });
});
