"use client";

import type { BlocksByViewport } from "@/types/editor";
import type {
  AvatarShape,
  PageBackgroundId,
  SidebarPosition,
  ViewportMode,
} from "@/types/page";
import { ProfileSidebar } from "@/components/layout/ProfileSidebar/ProfileSidebar";
import { BlockCanvas } from "@/components/builder/BlockCanvas/BlockCanvas";
import { PageLayout } from "@/components/layout/PageLayout/PageLayout";
import { getViewEffectiveSidebarPosition } from "@/lib/editor-engine/data/viewport";
import { useViewportMode } from "@/hooks/useViewportMode";

type PageViewProps = {
  username: string;
  title?: string;
  blocksByViewport: BlocksByViewport;
  background?: PageBackgroundId;
  sidebarPosition?: SidebarPosition;
  displayName?: string;
  bioHtml?: string;
  avatarUrl?: string;
  avatarShape?: AvatarShape;
  initialViewportMode?: ViewportMode;
};

export function PageView({
  username,
  title,
  blocksByViewport,
  background = "page-bg-1",
  sidebarPosition = "left",
  displayName,
  bioHtml,
  avatarUrl,
  avatarShape,
  initialViewportMode = "desktop",
}: PageViewProps) {
  const { viewportMode } = useViewportMode(initialViewportMode);

  const effectiveSidebarPosition = getViewEffectiveSidebarPosition(
    viewportMode,
    sidebarPosition,
  );

  const isMobile = viewportMode === "mobile";
  const visibleBlocks = isMobile
    ? blocksByViewport.mobile
    : blocksByViewport.desktop;
  const renderMode = isMobile ? "mobile" : "desktop";

  return (
    <PageLayout
      background={background}
      sidebarPosition={effectiveSidebarPosition}
      previewViewport={renderMode}
    >
      <ProfileSidebar
        variant="view"
        username={username}
        displayName={displayName}
        bioHtml={bioHtml}
        avatarUrl={avatarUrl}
        avatarShape={avatarShape}
      />
      <BlockCanvas
        editable={false}
        blocks={visibleBlocks}
        renderMode={renderMode}
        title={title}
      />
    </PageLayout>
  );
}
