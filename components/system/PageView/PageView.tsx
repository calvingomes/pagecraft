"use client";

import type { Block } from "@/types/editor";
import { ProfileSidebar } from "@/components/system/ProfileSidebar/ProfileSidebar";
import { BlockCanvas } from "@/components/system/BlockCanvas/BlockCanvas";
import layoutStyles from "@/components/layouts/PageLayout/PageLayout.module.css";

type PageViewProps = {
  username: string;
  title?: string;
  blocks: Block[];
};

export function PageView({ username, title, blocks }: PageViewProps) {
  return (
    <main className={layoutStyles.pageLayout}>
      <ProfileSidebar variant="view" username={username} />
      <BlockCanvas editable={false} blocks={blocks} title={title} />
    </main>
  );
}
