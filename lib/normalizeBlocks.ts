import type { Block, BlockType } from "@/types/editor";
import type { GridLayout } from "@/types/grid";
import { canPlaceBlockAt, findFirstFreeSpot } from "@/lib/blockPlacement";

export type RawFirestoreBlock = { id: string } & Record<string, unknown>;

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

// Normalizes older Firestore shapes (e.g. `data` instead of `content`).
export function normalizeFirestoreBlocks(
  rawBlocks: RawFirestoreBlock[],
): Block[] {
  return rawBlocks.map((raw, index) => {
    const type = raw.type as BlockType;
    const order = typeof raw.order === "number" ? raw.order : index;

    if (raw.content) {
      return { ...(raw as unknown as Block), order } as Block;
    }

    const data =
      raw.data && typeof raw.data === "object" && raw.data !== null
        ? (raw.data as Record<string, unknown>)
        : undefined;

    switch (type) {
      case "text":
        return {
          ...(raw as unknown as Block),
          order,
          content: {
            text: typeof data?.text === "string" ? data.text : "",
          },
        } as Block;
      case "link":
        return {
          ...(raw as unknown as Block),
          order,
          content: {
            url: typeof data?.url === "string" ? data.url : "",
            title: typeof data?.label === "string" ? data.label : "",
          },
        } as Block;
      case "image":
        return {
          ...(raw as unknown as Block),
          order,
          content: {
            url: typeof data?.url === "string" ? data.url : "",
            alt: typeof data?.alt === "string" ? data.alt : "",
          },
        } as Block;
      default:
        return { ...(raw as unknown as Block), order } as Block;
    }
  });
}

// Ensures blocks have a stable, non-overlapping layout matching the editor placement rules.
export function ensureBlocksHaveValidLayouts(blocks: Block[]): Block[] {
  const placed: Block[] = [];

  return [...blocks]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((block) => {
      if (isValidLayout(block.layout)) {
        const candidate = {
          x: block.layout.x,
          y: block.layout.y,
        };
        if (canPlaceBlockAt(block, candidate, placed)) {
          placed.push(block);
          return block;
        }
      }

      const pos = findFirstFreeSpot(block, placed);
      const next = { ...block, layout: pos } as Block;
      placed.push(next);
      return next;
    });
}
