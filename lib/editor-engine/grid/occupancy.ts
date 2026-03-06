import type { GridConfig, GridRect } from "@/types/grid";

/**
 * A simpler, O(1) spatial hash map (occupancy grid) to replace O(N) array reductions.
 * We store availability by iterating through sub-rows per column.
 */
export class OccupancyGrid {
  private grid = new Map<number, boolean>();
  private readonly cols: number;
  private readonly rowScale: number;

  constructor(config: GridConfig) {
    this.cols = config.cols;
    this.rowScale = config.rowScale;
  }

  /**
   * Encodes an X,Y coordinate into a single integer key for O(1) Map lookups.
   */
  private key(x: number, ySub: number): number {
    return x + ySub * this.cols;
  }

  /**
   * Marks a rectangle as occupied in the grid.
   */
  public mark(rect: GridRect): void {
    const startYSub = Math.round(rect.y * this.rowScale);
    const hSub = Math.max(1, Math.round(rect.h * this.rowScale));

    for (let x = rect.x; x < rect.x + rect.w; x++) {
      for (let ySub = startYSub; ySub < startYSub + hSub; ySub++) {
        this.grid.set(this.key(x, ySub), true);
      }
    }
  }

  /**
   * Checks if a given rectangle overlaps any currently occupied cells in the grid.
   */
  public isFree(rect: GridRect): boolean {
    if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > this.cols) {
      return false; // out of bounds
    }

    const startYSub = Math.round(rect.y * this.rowScale);
    const hSub = Math.max(1, Math.round(rect.h * this.rowScale));

    for (let x = rect.x; x < rect.x + rect.w; x++) {
      for (let ySub = startYSub; ySub < startYSub + hSub; ySub++) {
        if (this.grid.has(this.key(x, ySub))) {
          return false;
        }
      }
    }
    return true;
  }
}
