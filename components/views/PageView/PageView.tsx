"use client";

import type { Block } from "@/types/editor";
import type {
  AvatarShape,
  PageBackgroundId,
  SidebarPosition,
  ViewportMode,
} from "@/types/page";
import { ProfileSidebar } from "@/components/layout/ProfileSidebar/ProfileSidebar";
import { BlockCanvas } from "@/components/builder/BlockCanvas/BlockCanvas";
import { PageLayout } from "@/components/layout/PageLayout/PageLayout";
import { BottomBar } from "@/components/layout/Footer/BottomBar";
import { getViewEffectiveSidebarPosition } from "@/lib/editor-engine/data/viewport";
import { useViewportMode } from "@/hooks/useViewportMode";
import styles from "./PageView.module.css";

type PageViewProps = {
  username: string;
  title?: string;
  blocks: Block[];
  background?: PageBackgroundId;
  sidebarPosition?: SidebarPosition;
  displayName?: string;
  bioHtml?: string;
  avatarUrl?: string;
  avatarShape?: AvatarShape;
  initialViewportMode?: ViewportMode;
  updatedAt?: string;
};

export function PageView({
  username,
  title,
  blocks,
  background = "page-bg-1",
  sidebarPosition = "left",
  displayName,
  bioHtml,
  avatarUrl,
  avatarShape,
  initialViewportMode = "desktop",
  updatedAt,
}: PageViewProps) {
  const { viewportMode } = useViewportMode(initialViewportMode);

  const effectiveSidebarPosition = getViewEffectiveSidebarPosition(
    viewportMode,
    sidebarPosition,
  );

  const isMobile = viewportMode === "mobile";
  const renderMode = isMobile ? "mobile" : "desktop";

  const visibleBlocks = blocks
    .filter((b) => (isMobile ? b.visibility?.mobile !== false : b.visibility?.desktop !== false))
    .map((b) => ({
      ...b,
      layout: isMobile ? (b.mobileLayout ?? b.layout) : b.layout,
      styles: isMobile ? { ...b.styles, ...b.mobileStyles } : b.styles,
    }) as Block);

  return (
    <PageLayout
      background={background}
      sidebarPosition={effectiveSidebarPosition}
      previewViewport={renderMode}
      footer={<BottomBar />}
    >
      <div className={styles.container}>
        <ProfileSidebar
          variant="view"
          username={username}
          displayName={displayName}
          bioHtml={bioHtml}
          avatarUrl={avatarUrl}
          avatarShape={avatarShape}
          updatedAt={updatedAt}
        />
      </div>
      <div className={styles.container}>
        <BlockCanvas
          editable={false}
          blocks={visibleBlocks}
          renderMode={renderMode}
          title={title}
        />
      </div>
    </PageLayout>
  );
}
