import { supabase } from "@/lib/supabase/client";
import {
  ensureBlocksHaveValidLayouts,
  normalizeStoredBlocks,
  type RawStoredBlock,
} from "@/lib/editor-engine/data/normalization";
import type { Block } from "@/types/editor";

export const BlockService = {
  /**
   * Fetch all blocks for a page, normalized and split by viewport
   */
  getBlocksForPage: async (username: string): Promise<Block[]> => {
    const { data: blockRows } = await supabase
      .from("blocks")
      .select("id, type, order, content, layout, styles, viewport_mode")
      .eq("page_username", username)
      .order("order", { ascending: true });

    const safeBlockRows = blockRows ?? [];

    const rawBlocks: RawStoredBlock[] = safeBlockRows.map((row) => ({
      id: String(row.id),
      type: row.type,
      order: row.order,
      content: row.content,
      layout: row.layout,
      styles: row.styles,
    }));

    const normalizedBlocks = normalizeStoredBlocks(rawBlocks);
    const validBlocks = ensureBlocksHaveValidLayouts(normalizedBlocks);

    return validBlocks;
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
