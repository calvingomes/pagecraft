import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PageData } from "@/lib/services/page.client";
import type { Block } from "@/types/editor";
import {
  ensureBlocksHaveValidLayouts,
  normalizeStoredBlocks,
  type RawStoredBlock,
} from "@/lib/editor-engine/data/normalization";
import { DESKTOP_GRID, MOBILE_GRID } from "@/lib/editor-engine/grid/grid-config";

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

  getBlocksForPage: async (username: string): Promise<Block[]> => {
    const supabase = createSupabaseServerClient();
    const { data: blockRows } = await supabase
      .from("blocks")
      .select(
        "id, type, order, content, layout, styles, viewport_mode",
      )
      .eq("page_username", username)
      .order("order", { ascending: true });

    const safeBlockRows = (blockRows ?? []) as (RawStoredBlock & {
      viewport_mode: string;
    })[];

    // Normalize all blocks as a single unified list
    const normalizedBlocks = normalizeStoredBlocks(safeBlockRows);

    // We still want to ensure layouts are valid for both viewports
    const withDesktopLayouts = ensureBlocksHaveValidLayouts(
      normalizedBlocks,
      DESKTOP_GRID,
    );
    const withBothLayouts = ensureBlocksHaveValidLayouts(
      withDesktopLayouts,
      MOBILE_GRID,
      "mobile",
    );

    return withBothLayouts;
  },
};
