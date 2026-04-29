import { ServerPageService } from "@/lib/services/page.server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AvatarShape,
  PageBackgroundId,
  SidebarPosition,
} from "@/types/page";
import { PageView } from "@/components/views/PageView/PageView";
import { MobileUsernameCta } from "@/components/views/PageView/MobileUsernameCta";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { htmlToText } from "@/lib/utils/htmlToText";
import { headers } from "next/headers";
import { resolveViewportModeFromUA } from "@/lib/editor-engine/data/viewport";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const page = await ServerPageService.getPageByUsername(username);

  if (!page) {
    notFound();
  }

  const displayName = htmlToText(page.display_name || username);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pagecraft.me";
  const ogImageUrl = page.og_image_url;
  const description = `View ${displayName}'s profile on PageCraft.`;

  return {
    title: `${displayName} | PageCraft`,
    description,
    openGraph: {
      title: `${displayName} | PageCraft`,
      description,
      url: `${siteUrl}/${username}`,
      siteName: "PageCraft",
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630, alt: `${displayName}'s profile card` }] : [],
      type: "profile",
      username: username,
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} | PageCraft`,
      description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

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
    notFound();
  }

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const initialViewportMode = resolveViewportModeFromUA(userAgent);

  return (
    <>
      <Navbar
        cta={{ 
          label: "Craft your page", 
          href: "/",
          trackingEvent: "username_page_cta_click" 
        }}
        links={[{ label: "Login", href: "/auth?mode=signin" }]}
        logoColor="var(--color-forest-green)"
        transparentOnMobile
        disableMobileMenuTrigger
      />
      <PageView
        username={username}
        initialViewportMode={initialViewportMode}
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
        updatedAt={page.updated_at as string}
      />
      <MobileUsernameCta />
    </>
  );
}
