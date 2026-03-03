import { createClient } from "@supabase/supabase-js";

import type { Block } from "@/types/editor";
import type {
  AvatarShape,
  PageBackgroundId,
  SidebarPosition,
} from "@/types/page";
import { PageView } from "@/components/views/PageView/PageView";
import {
  ensureBlocksHaveValidLayouts,
  normalizeFirestoreBlocks,
  type RawFirestoreBlock,
} from "@/lib/normalizeBlocks";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function UserPage({ params }: Props) {
  const { username } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return <div>Supabase environment variables are missing</div>;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: page } = await supabase
    .from("pages")
    .select(
      "title, background, sidebar_position, display_name, bio_html, avatar_url, avatar_shape",
    )
    .eq("username", username)
    .maybeSingle();

  if (!page) {
    return <div>Page not found</div>;
  }

  const { data: blockRows } = await supabase
    .from("blocks")
    .select("id, type, order, content, layout, styles")
    .eq("page_username", username)
    .order("order", { ascending: true });

  const safeBlockRows = blockRows ?? [];

  const rawBlocks: RawFirestoreBlock[] = safeBlockRows.map(
    (row: {
      id: string;
      type: unknown;
      order: unknown;
      content: unknown;
      layout: unknown;
      styles: unknown;
    }) => ({
      id: row.id,
      type: row.type,
      order: row.order,
      content: row.content,
      layout: row.layout,
      styles: row.styles,
    }),
  );

  const normalizedBlocks = normalizeFirestoreBlocks(rawBlocks);

  // Ensure every block has a stable grid position matching the editor.
  const blocks: Block[] = ensureBlocksHaveValidLayouts(normalizedBlocks);

  return (
    <PageView
      username={username}
      title={(page.title as string | undefined) ?? undefined}
      background={
        (page.background as PageBackgroundId | undefined) ?? undefined
      }
      sidebarPosition={
        (page.sidebar_position as SidebarPosition | undefined) ?? undefined
      }
      displayName={(page.display_name as string | undefined) ?? undefined}
      bioHtml={(page.bio_html as string | undefined) ?? undefined}
      avatarUrl={(page.avatar_url as string | undefined) ?? undefined}
      avatarShape={(page.avatar_shape as AvatarShape | undefined) ?? undefined}
      blocks={blocks}
    />
  );
}
