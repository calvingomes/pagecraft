import type { Block, BlockType } from "@/types/editor";
import type { GridLayout, GridConfig } from "@/types/grid";
import { DESKTOP_GRID, MOBILE_GRID } from "../grid/grid-config";
import { canPlaceBlockAt, findFirstFreeSpot } from "../layout/collision";

export type RawStoredBlock = { id: string } & Record<string, unknown>;

export function isValidLayout(layout: unknown): layout is GridLayout {
  if (!layout || typeof layout !== "object") return false;
  const anyLayout = layout as Record<string, unknown>;
  return (
    typeof anyLayout.x === "number" &&
    Number.isFinite(anyLayout.x) &&
    typeof anyLayout.y === "number" &&
    Number.isFinite(anyLayout.y)
  );
}

// Normalizes stored blocks to ensure they match current schema and have valid defaults.
export function normalizeStoredBlocks(rawBlocks: RawStoredBlock[]): Block[] {
  return rawBlocks.map((raw, index) => {
    const type = raw.type as BlockType;
    const order = typeof raw.order === "number" ? raw.order : index;

    // Unpack mobile data from styles JSONB if it was parked there by the unified save logic
    const styles = (raw.styles as Record<string, unknown>) || {};
    const mobileLayout = (raw.mobileLayout || styles.mobileLayout || null) as GridLayout | null;
    const mobileStyles = raw.mobileStyles || styles.mobileStyles || null;
    const visibility = raw.visibility || styles.visibility || null;

    const baseBlock = {
      ...(raw as unknown as Block),
      order,
      mobileLayout,
      mobileStyles,
      visibility,
      styles: { ...styles },
    };

    // Clean up sections - titles are always full-width half-rows
    if (type === "sectionTitle") {
      baseBlock.styles.widthPreset = "full";
    }

    // Remove the nested versions from styles to keep memory clean
    delete baseBlock.styles.mobileLayout;
    delete baseBlock.styles.mobileStyles;
    delete baseBlock.styles.visibility;

    return baseBlock as Block;
  });
}

// Ensures blocks have a stable, non-overlapping layout matching the editor placement rules.
export function ensureBlocksHaveValidLayouts(
  blocks: Block[],
  config: GridConfig = DESKTOP_GRID,
  viewport: "desktop" | "mobile" = "desktop",
): Block[] {
  const placed: Block[] = [];

  const layoutKey = viewport === "mobile" ? "mobileLayout" : "layout";

  const normalized = [...blocks]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((block) => {
      const currentLayout = block[layoutKey];
      const isHidden = viewport === "mobile" 
        ? block.visibility?.mobile === false 
        : block.visibility?.desktop === false;

      // To evaluate collision correctly, we only mark 'placed' blocks that are actually visible on this viewport.
      // Hidden blocks should not 'consume' space or block other elements.
      const projectedPlaced = placed
        .filter((b) => (viewport === "mobile" ? b.visibility?.mobile !== false : b.visibility?.desktop !== false))
        .map((b) => ({
          ...b,
          layout: viewport === "mobile" ? (b.mobileLayout ?? b.layout) : b.layout,
          styles: viewport === "mobile" ? { ...b.styles, ...b.mobileStyles } : b.styles,
        }) as Block);

      const projectedBlock = {
        ...block,
        layout: viewport === "mobile" ? (block.mobileLayout ?? block.layout) : block.layout,
        styles: viewport === "mobile" ? { ...block.styles, ...block.mobileStyles } : block.styles,
      } as Block;

      // If the block is hidden, we still ensure it has a valid layout (in case it is toggled on later),
      // but we don't let it collide with the current 'visible' projection.
      if (!isHidden && isValidLayout(currentLayout)) {
        const candidate = { x: currentLayout.x, y: currentLayout.y };
        if (canPlaceBlockAt(projectedBlock, candidate, projectedPlaced, config)) {
          placed.push(block);
          return block;
        }
      }

      const pos = findFirstFreeSpot(projectedBlock, projectedPlaced, config);
      const next = { ...block, [layoutKey]: pos } as Block;
      placed.push(next);
      return next;
    });

  return normalized;
}

/**
 * Convenience helper to run layout validation for both viewports at once.
 * Essential for unified content state to ensure a block always has a safe spot everywhere.
 */
export function ensureBlocksHaveValidLayoutsForAllViewports(blocks: Block[]): Block[] {
  const desktopNormalized = ensureBlocksHaveValidLayouts(blocks, DESKTOP_GRID, "desktop");
  return ensureBlocksHaveValidLayouts(desktopNormalized, MOBILE_GRID, "mobile");
}
