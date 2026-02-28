"use client";

import type { Block } from "@/types/editor";
import { ProfileSidebar } from "@/components/builder/ProfileSidebar/ProfileSidebar";
import { BlockCanvas } from "@/components/builder/BlockCanvas/BlockCanvas";
import { PageLayout } from "@/components/layout/PageLayout/PageLayout";

type PageViewProps = {
  username: string;
  title?: string;
  blocks: Block[];
};

export function PageView({ username, title, blocks }: PageViewProps) {
  return (
    <PageLayout>
      <ProfileSidebar variant="view" username={username} />
      <BlockCanvas editable={false} blocks={blocks} title={title} />
    </PageLayout>
  );
}
