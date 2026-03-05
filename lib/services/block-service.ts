import { supabase } from "@/lib/supabase";
import type { Block } from "@/types/editor";
import {
  ensureBlocksHaveValidLayouts,
  normalizeStoredBlocks,
  type RawStoredBlock,
} from "@/lib/normalizeBlocks";
import { compactEmptyRows } from "@/lib/compactEmptyRows";

export const BlockService = {
  /**
   * Fetch all blocks for a page, normalized and split by viewport
   */
  getBlocksForPage: async (username: string) => {
    const { data: blockRows } = await supabase
      .from("blocks")
      .select("id, type, order, content, layout, styles, viewport_mode")
      .eq("page_username", username)
      .order("order", { ascending: true });

    const safeBlockRows = blockRows ?? [];

    const toRawStoredBlock = (row: {
      id: string | number;
      type: unknown;
      order: unknown;
      content: unknown;
      layout: unknown;
      styles: unknown;
    }): RawStoredBlock => ({
      id: String(row.id),
      type: row.type,
      order: row.order,
      content: row.content,
      layout: row.layout,
      styles: row.styles,
    });

    const normalizeForViewport = (rows: RawStoredBlock[]) => {
      const normalizedBlocks = normalizeStoredBlocks(rows);
      return ensureBlocksHaveValidLayouts(normalizedBlocks);
    };

    const desktopRows = safeBlockRows
      .filter((row) => row.viewport_mode !== "mobile")
      .map(toRawStoredBlock);

    const mobileRows = safeBlockRows
      .filter((row) => row.viewport_mode === "mobile")
      .map(toRawStoredBlock);

    // For editor use (compacted)
    const getCompacted = (rows: RawStoredBlock[]) => {
      const normalized = normalizeForViewport(rows);
      return compactEmptyRows(normalized).blocks;
    };

    return {
      desktop: getCompacted(desktopRows),
      mobile: getCompacted(mobileRows),
      // Raw normalized versions if needed for view mode without compaction logic?
      // Actually view mode also needs valid layouts.
      // We return 'compacted' blocks as the standard 'Block[]'
    };
  },

  /**
   * Create initial starter blocks for a new user
   */
  createStarterBlocks: async (username: string, userId: string) => {
    const starterBlocks = [
      {
        id: crypto.randomUUID(),
        page_username: username,
        uid: userId,
        viewport_mode: "desktop",
        type: "text",
        order: 0,
        content: {
          text: `<p>Hi, I'm ${username} 👋</p>`,
        },
        layout: { x: 0, y: 0 },
      },
      {
        id: crypto.randomUUID(),
        page_username: username,
        uid: userId,
        viewport_mode: "desktop",
        type: "link",
        order: 1,
        content: {
          url: "https://example.com",
          title: "My Website",
        },
        layout: { x: 1, y: 0 },
      },
    ];

    const { error } = await supabase.from("blocks").insert(starterBlocks);
    if (error) throw error;
  },
};
