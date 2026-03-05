import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PageData } from "@/lib/services/page.client";
import type { BlocksByViewport } from "@/types/editor";
import {
  ensureBlocksHaveValidLayouts,
  normalizeStoredBlocks,
  type RawStoredBlock,
} from "@/lib/editor-engine/data/normalization";

/**
 * Server-side service to fetch page data directly
 * (bypassing client-side singletons)
 */
export const ServerPageService = {
  getPageByUsername: async (username: string): Promise<PageData | null> => {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("pages")
      .select(
        "title, background, sidebar_position, display_name, bio_html, avatar_url, avatar_shape",
      )
      .eq("username", username)
      .maybeSingle();

    return data as PageData | null;
  },

  getBlocksForPage: async (username: string): Promise<BlocksByViewport> => {
    const supabase = createSupabaseServerClient();
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

    return {
      desktop: normalizeForViewport(desktopRows),
      mobile: normalizeForViewport(mobileRows),
    };
  },
};
