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
  getPageByUsername: async (
    username: string,
    client?: ReturnType<typeof createSupabaseServerClient>,
  ): Promise<PageData | null> => {
    const supabase = client ?? createSupabaseServerClient();
    const { data } = await supabase
      .from("pages")
      .select(
        "title, background, sidebar_position, display_name, bio_html, avatar_url, avatar_shape",
      )
      .eq("username", username)
      .maybeSingle();

    return data as PageData | null;
  },

  getBlocksForPage: async (
    username: string,
    client?: ReturnType<typeof createSupabaseServerClient>,
  ): Promise<Block[]> => {
    const supabase = client ?? createSupabaseServerClient();
    const { data: blockRows } = await supabase
      .from("blocks")
      .select("id, type, order, content, layout, styles, viewport_mode")
      .eq("page_username", username)
      .order("order", { ascending: true });

    const safeBlockRows = (blockRows ?? []) as (RawStoredBlock & {
      viewport_mode: string;
    })[];

    // Normalize all blocks as a single unified list
    const normalizedBlocks = normalizeStoredBlocks(safeBlockRows);

    // OPTIMIZATION: For public SSR view, we trust the stored layouts if they are valid.
    // This avoids expensive collision-detection math for every single page load.
    const needsDesktopNormalization = normalizedBlocks.some(
      (b) => !b.layout || typeof b.layout.x !== "number",
    );
    const needsMobileNormalization = normalizedBlocks.some(
      (b) => !b.mobileLayout || typeof b.mobileLayout.x !== "number",
    );

    let blocks = normalizedBlocks;

    if (needsDesktopNormalization) {
      blocks = ensureBlocksHaveValidLayouts(blocks, DESKTOP_GRID, "desktop");
    }

    if (needsMobileNormalization) {
      blocks = ensureBlocksHaveValidLayouts(blocks, MOBILE_GRID, "mobile");
    }

    return blocks;
  },
};
