"use client";

import type { Block } from "@/types/editor";
import type { PageBackgroundId } from "@/types/page";
import { ProfileSidebar } from "@/components/layout/ProfileSidebar/ProfileSidebar";
import { BlockCanvas } from "@/components/builder/BlockCanvas/BlockCanvas";
import { PageLayout } from "@/components/layout/PageLayout/PageLayout";

type PageViewProps = {
  username: string;
  title?: string;
  blocks: Block[];
  background?: PageBackgroundId;
};

export function PageView({
  username,
  title,
  blocks,
  background = "page-bg-1",
}: PageViewProps) {
  return (
    <PageLayout background={background}>
      <ProfileSidebar variant="view" username={username} />
      <BlockCanvas editable={false} blocks={blocks} title={title} />
    </PageLayout>
  );
}
