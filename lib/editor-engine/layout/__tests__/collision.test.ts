import { describe, it, expect } from "vitest";
import { canPlaceBlockAt, findFirstFreeSpot } from "../collision";
import { DESKTOP_GRID } from "../../grid/grid-config";
import { Block } from "@/types/editor";

describe("collision - Grid Placement Logic", () => {
  const defaultBlock: Partial<Block> = {
    type: "text",
    styles: { widthPreset: "small" }, // 1x1 on desktop (w:1, h:1 * rowScale=2) -> width:1, height:1
  };

  describe("canPlaceBlockAt", () => {
    it("returns true when placing in an empty grid", () => {
      const b1 = { ...defaultBlock, id: "b1" } as Block;
      expect(canPlaceBlockAt(b1, { x: 0, y: 0 }, [], DESKTOP_GRID)).toBe(true);
    });

    it("returns false when overlapping with another block", () => {
      const b1 = { ...defaultBlock, id: "b1", layout: { x: 0, y: 0 } } as Block;
      const b2 = { ...defaultBlock, id: "b2" } as Block;
      
      expect(canPlaceBlockAt(b2, { x: 0, y: 0 }, [b1], DESKTOP_GRID)).toBe(false);
    });

    it("returns true when placing next to another block", () => {
      const b1 = { ...defaultBlock, id: "b1", layout: { x: 0, y: 0 } } as Block;
      const b2 = { ...defaultBlock, id: "b2" } as Block;
      
      expect(canPlaceBlockAt(b2, { x: 1, y: 0 }, [b1], DESKTOP_GRID)).toBe(true);
      expect(canPlaceBlockAt(b2, { x: 0, y: 1 }, [b1], DESKTOP_GRID)).toBe(true);
    });

    it("respects boundary boundaries (out of bounds returns false indirectly via isFree check)", () => {
       const b1 = { ...defaultBlock, id: "b1" } as Block;
       // DESKTOP_GRID has 4 columns. Placing 1x1 at x=4 is OOB.
       expect(canPlaceBlockAt(b1, { x: 4, y: 0 }, [], DESKTOP_GRID)).toBe(false);
    });
  });

  describe("findFirstFreeSpot", () => {
    it("returns (0,0) for the first block in an empty grid", () => {
      const b1 = { ...defaultBlock, id: "b1" } as Block;
      expect(findFirstFreeSpot(b1, [], DESKTOP_GRID)).toEqual({ x: 0, y: 0 });
    });

    it("finds the first available hole when the top-left is taken", () => {
      const b1 = { ...defaultBlock, id: "b1", layout: { x: 0, y: 0 } } as Block;
      const b2 = { ...defaultBlock, id: "b2" } as Block;
      
      // b1 takes (0,0), next should be (1,0)
      expect(findFirstFreeSpot(b2, [b1], DESKTOP_GRID)).toEqual({ x: 1, y: 0 });
    });

    it("skips to the next row if the current row is full", () => {
      const placed: Block[] = [
        { ...defaultBlock, id: "b1", layout: { x: 0, y: 0 } } as Block,
        { ...defaultBlock, id: "b2", layout: { x: 1, y: 0 } } as Block,
        { ...defaultBlock, id: "b3", layout: { x: 2, y: 0 } } as Block,
        { ...defaultBlock, id: "b4", layout: { x: 3, y: 0 } } as Block,
      ];
      const b5 = { ...defaultBlock, id: "b5" } as Block;
      
      // Row 0 is full (4 cols). Should move to Row 1.0 (y: 1)
      // Note: DESKTOP_GRID rowScale is 2, so h=1 blocks occupy y=0 and y=0.5.
      expect(findFirstFreeSpot(b5, placed, DESKTOP_GRID)).toEqual({ x: 0, y: 1 });
    });
  });
});
