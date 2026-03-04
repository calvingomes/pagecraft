import React, { ReactNode } from "react";
import type {
  PageBackgroundId,
  PreviewViewport,
  SidebarPosition,
} from "@/types/page";
import styles from "./PageLayout.module.css";

type PageLayoutProps = {
  children: ReactNode;
  background?: PageBackgroundId;
  sidebarPosition?: SidebarPosition;
  previewViewport?: PreviewViewport;
  framedMobilePreview?: boolean;
};

export function PageLayout({
  children,
  background = "page-bg-1",
  sidebarPosition = "left",
  previewViewport = "desktop",
  framedMobilePreview = false,
}: PageLayoutProps) {
  const [sidebar, content] = React.Children.toArray(children);

  return (
    <main
      className={styles.pageLayout}
      data-bg={background}
      data-sidebar={sidebarPosition}
      data-preview={previewViewport}
      data-framed-mobile-preview={framedMobilePreview ? "true" : "false"}
    >
      <div className={styles.inner}>
        <aside className={styles.sidebarSlot}>{sidebar}</aside>
        <section className={styles.contentSlot}>{content}</section>
      </div>
    </main>
  );
}
