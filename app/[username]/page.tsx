import { ServerPageService } from "@/lib/services/page.server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AvatarShape,
  PageBackgroundId,
  SidebarPosition,
} from "@/types/page";
import { PageView } from "@/components/views/PageView/PageView";
import { Navbar } from "@/components/layout/Navbar/Navbar";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function UserPage({ params }: Props) {
  const { username } = await params;

  const supabase = createSupabaseServerClient();

  // Parallelize the database fetches to avoid Waterfall latency.
  // This can significantly reduce TTFB on the user's profile.
  const [page, blocks] = await Promise.all([
    ServerPageService.getPageByUsername(username, supabase),
    ServerPageService.getBlocksForPage(username, supabase),
  ]);

  if (!page) {
    return <div>Page not found</div>;
  }

  return (
    <>
      <Navbar background={page.background as PageBackgroundId} />
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
        avatarShape={
          (page.avatar_shape as AvatarShape | undefined) ?? undefined
        }
        blocks={blocks}
      />
    </>
  );
}
