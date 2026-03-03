"use client";

import type { Block } from "@/types/editor";
import type {
  AvatarShape,
  PageBackgroundId,
  SidebarPosition,
} from "@/types/page";
import { ProfileSidebar } from "@/components/layout/ProfileSidebar/ProfileSidebar";
import { BlockCanvas } from "@/components/builder/BlockCanvas/BlockCanvas";
import { PageLayout } from "@/components/layout/PageLayout/PageLayout";

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
}: PageViewProps) {
  return (
    <PageLayout background={background} sidebarPosition={sidebarPosition}>
      <ProfileSidebar
        variant="view"
        username={username}
        position={sidebarPosition}
        displayName={displayName}
        bioHtml={bioHtml}
        avatarUrl={avatarUrl}
        avatarShape={avatarShape}
      />
      <BlockCanvas editable={false} blocks={blocks} title={title} />
    </PageLayout>
  );
}
