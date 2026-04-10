import { describe, it, expect } from "vitest";
import type { Layout } from "react-grid-layout";
import { blockToRglItem } from "../blockToRglItem";
import { rglLayoutToBlockUpdates } from "../rglLayoutToBlockUpdates";
import { DESKTOP_GRID } from "@/lib/editor-engine/grid/grid-config";
import type { Block } from "@/types/editor";

describe("RGL Adapters", () => {
  const mockBlock: Block = {
    id: "b1",
    type: "text",
    order: 0,
    content: { text: "hello" },
    styles: { widthPreset: "small" },
    layout: { x: 1, y: 2 },
  };

  describe("blockToRglItem", () => {
    it("scales Y coordinate by config.rowScale", () => {
      const result = blockToRglItem(mockBlock, DESKTOP_GRID);

      expect(result.i).toBe("b1");
      expect(result.x).toBe(1);
      // DESKTOP_GRID.rowScale is 2, so y=2 becomes y=4
      expect(result.y).toBe(4);
      expect(result.w).toBe(1);
      expect(result.h).toBe(2); // small is 1x1, scaled by 2 = 2
    });
  });

  describe("rglLayoutToBlockUpdates", () => {
    it("converts RGL layout changes back to logical coordinates", () => {
      const newLayout = [
        { i: "b1", x: 2, y: 6, w: 1, h: 2 }, // moved from (1,4) to (2,6)
      ] satisfies Layout[];
      const snapshot = {
        b1: { x: 1, y: 2 },
      };

      const updates = rglLayoutToBlockUpdates(
        newLayout,
        snapshot,
        DESKTOP_GRID,
      );

      expect(updates).toHaveLength(1);
      expect(updates[0]).toEqual({
        id: "b1",
        x: 2,
        y: 3, // 6 / rowScale(2) = 3
      });
    });

    it("returns empty array if no movement occurred", () => {
      const newLayout = [
        { i: "b1", x: 1, y: 4, w: 1, h: 2 },
      ] satisfies Layout[];
      const snapshot = {
        b1: { x: 1, y: 2 },
      };

      const updates = rglLayoutToBlockUpdates(
        newLayout,
        snapshot,
        DESKTOP_GRID,
      );
      expect(updates).toHaveLength(0);
    });
  });
});
