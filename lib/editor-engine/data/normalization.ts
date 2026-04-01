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

// Normalizes older stored shapes (e.g. `data` instead of `content`).
export function normalizeStoredBlocks(rawBlocks: RawStoredBlock[]): Block[] {
  return rawBlocks.map((raw, index) => {
    const type = raw.type as BlockType;
    const order = typeof raw.order === "number" ? raw.order : index;

    const rawStyles = { ...((raw.styles as Record<string, unknown>) || {}) };
    const mobileLayout =
      (raw.mobileLayout ?? rawStyles.mobileLayout) as Block["mobileLayout"] ?? undefined;
    const mobileStyles =
      (raw.mobileStyles ?? rawStyles.mobileStyles) as Block["mobileStyles"] ?? undefined;
    const visibility =
      (raw.visibility ?? rawStyles.visibility) as Block["visibility"] ?? undefined;

    delete rawStyles.mobileLayout;
    delete rawStyles.mobileStyles;
    delete rawStyles.visibility;

    // Base normalization for unified state
    const normalizedBase = {
      ...(raw as unknown as Block),
      order,
      styles: Object.keys(rawStyles).length > 0 ? rawStyles : undefined,
      mobileLayout,
      mobileStyles,
      visibility,
    };

    if (raw.content) {
      if (type === "sectionTitle") {
        const rawStyles =
          raw.styles && typeof raw.styles === "object" && raw.styles !== null
            ? (raw.styles as Record<string, unknown>)
            : undefined;

        return {
          ...normalizedBase,
          styles: {
            ...(rawStyles as object),
            widthPreset: "full",
          },
        } as Block;
      }

      return normalizedBase as Block;
    }

    const data =
      raw.data && typeof raw.data === "object" && raw.data !== null
        ? (raw.data as Record<string, unknown>)
        : undefined;

    switch (type) {
      case "text":
        return {
          ...normalizedBase,
          content: {
            text: typeof data?.text === "string" ? data.text : "",
          },
        } as Block;
      case "link":
        return {
          ...normalizedBase,
          content: {
            url: typeof data?.url === "string" ? data.url : "",
            title: typeof data?.title === "string" ? data.title : "",
            imageUrl: typeof data?.imageUrl === "string" ? data.imageUrl.split("?")[0] : undefined,
            iconUrl: typeof data?.iconUrl === "string" ? data.iconUrl.split("?")[0] : undefined,
          },
        } as Block;
      case "image":
        return {
          ...normalizedBase,
          content: {
            url: typeof data?.url === "string" ? data.url.split("?")[0] : "",
            alt: typeof data?.alt === "string" ? data.alt : "",
          },
        } as Block;
      case "sectionTitle":
        return {
          ...normalizedBase,
          styles: {
            ...((raw.styles as Record<string, unknown> | undefined) ?? {}),
            widthPreset: "full",
          },
          content: {
            title: typeof data?.title === "string" ? data.title : "",
          },
        } as Block;
      default:
        return normalizedBase as Block;
    }
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

      // To evaluate collision, we must project the 'placed' blocks so math helpers see the right coordinates/styles
      const projectedPlaced = placed.map((b) => ({
        ...b,
        layout: viewport === "mobile" ? (b.mobileLayout ?? b.layout) : b.layout,
        styles: viewport === "mobile" ? { ...b.styles, ...b.mobileStyles } : b.styles,
      }) as Block);

      const projectedBlock = {
        ...block,
        layout: viewport === "mobile" ? (block.mobileLayout ?? block.layout) : block.layout,
        styles: viewport === "mobile" ? { ...block.styles, ...block.mobileStyles } : block.styles,
      } as Block;

      if (isValidLayout(currentLayout)) {
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
