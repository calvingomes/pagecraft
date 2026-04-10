import { describe, it, expect } from "vitest";
import { OccupancyGrid } from "../occupancy";
import { DESKTOP_GRID } from "../grid-config";

describe("OccupancyGrid", () => {
  it("initializes with correct columns and evaluates empty space as free", () => {
    const grid = new OccupancyGrid(DESKTOP_GRID);
    expect(grid.isFree({ x: 0, y: 0, w: 1, h: 1 })).toBe(true);
  });

  it("returns false for out of bounds coordinates", () => {
    const grid = new OccupancyGrid(DESKTOP_GRID);
    // x < 0
    expect(grid.isFree({ x: -1, y: 0, w: 1, h: 1 })).toBe(false);
    // x + w > cols (4)
    expect(grid.isFree({ x: 4, y: 0, w: 1, h: 1 })).toBe(false);
    // y < 0
    expect(grid.isFree({ x: 0, y: -1, w: 1, h: 1 })).toBe(false);
  });

  it("marks space as occupied and detects collisions", () => {
    const grid = new OccupancyGrid(DESKTOP_GRID);
    grid.mark({ x: 0, y: 0, w: 2, h: 1 });

    // Inside the marked area
    expect(grid.isFree({ x: 0, y: 0, w: 1, h: 1 })).toBe(false);
    expect(grid.isFree({ x: 1, y: 0, w: 1, h: 1 })).toBe(false);

    // Adjacent but not overlapping
    expect(grid.isFree({ x: 2, y: 0, w: 1, h: 1 })).toBe(true);
    expect(grid.isFree({ x: 0, y: 1, w: 1, h: 1 })).toBe(true);
  });

  it("respects sub-row precision (rowScale)", () => {
    const grid = new OccupancyGrid(DESKTOP_GRID); // rowScale = 2 (increments of 0.5)
    
    // Mark specifically row 0.5 to 1.0 (height 0.5)
    grid.mark({ x: 0, y: 0.5, w: 1, h: 0.5 });

    // Row 0 is free
    expect(grid.isFree({ x: 0, y: 0, w: 1, h: 0.5 })).toBe(true);
    
    // Row 0.5 is taken
    expect(grid.isFree({ x: 0, y: 0.5, w: 1, h: 0.5 })).toBe(false);

    // Overlapping search
    expect(grid.isFree({ x: 0, y: 0.25, w: 1, h: 0.5 })).toBe(false); // Covers y=0.5
  });
});
