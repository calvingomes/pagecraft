import { ServerPageService } from "@/lib/services/server-page-service";
import type {
  AvatarShape,
  PageBackgroundId,
  SidebarPosition,
} from "@/types/page";
import { PageView } from "@/components/views/PageView/PageView";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function UserPage({ params }: Props) {
  const { username } = await params;

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
      blocksByViewport={blocksByViewport}
    />
  );
}
