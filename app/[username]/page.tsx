import { headers } from "next/headers";
import { ServerPageService } from "@/lib/services/page.server";
import { resolveViewportModeFromUserAgent } from "@/lib/editor-engine/data/viewport";
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
  const headerStore = await headers();
  const initialViewportMode = resolveViewportModeFromUserAgent(
    headerStore.get("user-agent"),
  );

  // Use the dedicated server service to fetch data
  // This handles the server-side supabase client creation internally
  let page;
  try {
    page = await ServerPageService.getPageByUsername(username);
  } catch (error) {
    console.error("Failed to fetch page:", error);
    return <div>Error loading page configuration</div>;
  }

  if (!page) {
    return <div>Page not found</div>;
  }

  let blocksByViewport;
  try {
    blocksByViewport = await ServerPageService.getBlocksForPage(username);
  } catch (error) {
    console.error("Failed to fetch blocks:", error);
    return <div>Error loading page content</div>;
  }

  return (
    <>
      <Navbar />
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
        blocksByViewport={blocksByViewport}
        initialViewportMode={initialViewportMode}
      />
    </>
  );
}
