import { describe, it, expect } from "vitest";
import { 
  normalizeStoredBlocks, 
  ensureBlocksHaveValidLayouts,
  type RawStoredBlock
} from "../normalization";
import { Block } from "@/types/editor";
import { DESKTOP_GRID } from "../../grid/grid-config";

describe("normalization", () => {
  describe("normalizeStoredBlocks", () => {
    it("ensures sectionTitle always has widthPreset: 'full'", () => {
      const raw = [
        { id: "1", type: "sectionTitle", styles: {}, content: { title: "Hello" } }
      ];
      const normalized = normalizeStoredBlocks(raw as RawStoredBlock[]);
      expect(normalized[0].styles?.widthPreset).toBe("full");
    });

    it("assigns order based on index if missing", () => {
      const raw = [
        { id: "a", type: "text" },
        { id: "b", type: "text" }
      ];
      const normalized = normalizeStoredBlocks(raw as RawStoredBlock[]);
      expect(normalized[0].order).toBe(0);
      expect(normalized[1].order).toBe(1);
    });

    it("unpacks mobile data from styles JSONB", () => {
      const raw = [
        { 
          id: "1", 
          type: "text", 
          styles: { 
            mobileLayout: { x: 0, y: 10 },
            mobileStyles: { widthPreset: "wide" },
            visibility: { desktop: true, mobile: false }
          } 
        }
      ];
      const normalized = normalizeStoredBlocks(raw as RawStoredBlock[]);
      expect(normalized[0].mobileLayout).toEqual({ x: 0, y: 10 });
      expect(normalized[0].mobileStyles?.widthPreset).toBe("wide");
      expect(normalized[0].visibility?.mobile).toBe(false);
      // Ensure they were cleaned out of the styles object
      expect(normalized[0].styles?.mobileLayout).toBeUndefined();
    });
  });

  describe("ensureBlocksHaveValidLayouts", () => {
    it("leaves non-overlapping blocks untouched", () => {
      const blocks: Partial<Block>[] = [
        { id: "1", type: "text", layout: { x: 0, y: 0 }, styles: { widthPreset: "small" }, order: 0 },
        { id: "2", type: "text", layout: { x: 1, y: 0 }, styles: { widthPreset: "small" }, order: 1 }
      ];
      
      const healed = ensureBlocksHaveValidLayouts(blocks as Block[], DESKTOP_GRID);
      expect(healed[0].layout?.x).toBe(0);
      expect(healed[1].layout?.x).toBe(1);
    });

    it("heals overlapping blocks by pushing the second one to the next free spot", () => {
      // Two 1x1 blocks both at (0,0)
      const blocks: Partial<Block>[] = [
        { id: "1", type: "text", layout: { x: 0, y: 0 }, styles: { widthPreset: "small" }, order: 0 },
        { id: "2", type: "text", layout: { x: 0, y: 0 }, styles: { widthPreset: "small" }, order: 1 }
      ];
      
      const healed = ensureBlocksHaveValidLayouts(blocks as Block[], DESKTOP_GRID);
      
      // First block stays at (0,0)
      expect(healed[0].layout).toEqual({ x: 0, y: 0 });
      
      // Second block should have been moved. 
      // In a 4-col grid, (1,0) should be the next free spot.
      expect(healed[1].layout).not.toEqual({ x: 0, y: 0 });
      expect(healed[1].layout?.x).not.toBeNull();
      expect(healed[1].layout?.y).not.toBeNull();
    });

    it("respects 'order' when deciding which block to move", () => {
      // Block 2 has lower order but is second in array
      const blocks: Partial<Block>[] = [
        { id: "1", type: "text", layout: { x: 0, y: 0 }, styles: { widthPreset: "small" }, order: 10 },
        { id: "2", type: "text", layout: { x: 0, y: 0 }, styles: { widthPreset: "small" }, order: 0 }
      ];
      
      const healed = ensureBlocksHaveValidLayouts(blocks as Block[], DESKTOP_GRID);
      
      // Because we sort by order first, Block 2 (order 0) stays at (0,0)
      const block2 = healed.find(b => b.id === "2");
      const block1 = healed.find(b => b.id === "1");
      
      expect(block2?.layout).toEqual({ x: 0, y: 0 });
      expect(block1?.layout).not.toEqual({ x: 0, y: 0 });
    });

    it("ignores hidden blocks during collision checks (no ghost blocks)", () => {
      const blocks: Partial<Block>[] = [
        { 
          id: "hidden-desktop", 
          type: "text", 
          layout: { x: 0, y: 0 }, 
          visibility: { desktop: false, mobile: true },
          styles: { widthPreset: "small" }, 
          order: 0 
        },
        { 
          id: "visible-desktop", 
          type: "text", 
          layout: { x: 0, y: 0 }, 
          visibility: { desktop: true, mobile: true },
          styles: { widthPreset: "small" }, 
          order: 1 
        }
      ];
      
      const healed = ensureBlocksHaveValidLayouts(blocks as Block[], DESKTOP_GRID, "desktop");
      
      // The hidden block 'hidden-desktop' (order 0) is hidden on desktop.
      // The visible block 'visible-desktop' (order 1) starts at (0,0).
      // Because the hidden block is ignored during collision, the visible block should STAY at (0,0).
      const visible = healed.find(b => b.id === "visible-desktop");
      expect(visible?.layout).toEqual({ x: 0, y: 0 });
    });
  });
});
