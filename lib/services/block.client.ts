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
    const { data: blockRows, error } = await supabase
      .from("blocks")
      .select("id, type, order, content, layout, styles, viewport_mode")
      .eq("page_username", username)
      .order("order", { ascending: true });

    if (error) throw error;

    const safeBlockRows = blockRows ?? [];

    const rawBlocks: RawStoredBlock[] = safeBlockRows.map((row) => ({
      id: String(row.id),
      type: row.type,
      order: row.order,
      content: row.content,
      layout: row.layout,
      styles: row.styles,
      viewport_mode: row.viewport_mode,
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
        type: "sectionTitle",
        order: 0,
        content: {
          title: `Welcome to ${username}'s page!`,
        },
        layout: { x: 0, y: 0 },
        styles: { widthPreset: "full" },
      },
      {
        id: crypto.randomUUID(),
        page_username: username,
        uid: userId,
        viewport_mode: "desktop",
        type: "image",
        order: 1,
        content: {
          url: "/starter-welcome.webp",
          alt: "Welcome to PageCraft",
        },
        layout: { x: 0, y: 1 },
        styles: {
          widthPreset: "large",
          mobileLayout: { x: 0, y: 1 },
        },
      },
      {
        id: crypto.randomUUID(),
        page_username: username,
        uid: userId,
        viewport_mode: "desktop",
        type: "text",
        order: 2,
        content: {
          text: `<p>This is PageCraft—a block-based page builder that gives you full control over your layout. Drag things around, customize every block, and make it yours.</p>`,
        },
        layout: { x: 2, y: 1 },
        styles: {
          widthPreset: "wide",
          mobileLayout: { x: 0, y: 3 },
        },
      },
      {
        id: crypto.randomUUID(),
        page_username: username,
        uid: userId,
        viewport_mode: "desktop",
        type: "link",
        order: 3,
        content: {
          url: "https://pagecraft.me",
          title: "My Portfolio",
        },
        layout: { x: 2, y: 2 },
        styles: {
          widthPreset: "small",
          mobileLayout: { x: 0, y: 4 },
        },
      },
      {
        id: crypto.randomUUID(),
        page_username: username,
        uid: userId,
        viewport_mode: "desktop",
        type: "link",
        order: 4,
        content: {
          url: "https://twitter.com",
          title: "Twitter / X",
        },
        layout: { x: 3, y: 2 },
        styles: {
          widthPreset: "small",
          mobileLayout: { x: 1, y: 4 },
        },
      },
    ];

    const { error } = await supabase.from("blocks").insert(starterBlocks);
    if (error) throw error;
  },
};
