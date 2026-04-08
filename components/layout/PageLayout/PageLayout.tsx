"use client";

import React, { useEffect } from "react";
import { PAGE_THEMES, DEFAULT_PAGE_THEME } from "@/lib/page-theme";
import styles from "./PageLayout.module.css";
import type { PageLayoutProps } from "./PageLayout.types";

export function PageLayout({
  children,
  footer,
  background = "page-bg-1",
  sidebarPosition = "left",
  previewViewport = "desktop",
  framedMobilePreview = false,
  isEditor = false,
}: PageLayoutProps) {
  const [sidebar, content] = React.Children.toArray(children);

  const theme = PAGE_THEMES[background] || DEFAULT_PAGE_THEME;
  const isMobilePreview = previewViewport === "mobile" && framedMobilePreview;

  useEffect(() => {
    if (isMobilePreview) {
      document.body.style.backgroundColor = "var(--color-lighter-grey)";
    } else {
      document.body.style.backgroundColor = theme.bg;
    }
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, [theme.bg, isMobilePreview]);

  return (
    <main
      className={styles.pageLayout}
      data-sidebar={sidebarPosition}
      data-preview={previewViewport}
      data-framed-mobile-preview={framedMobilePreview ? "true" : "false"}
      data-is-editor={isEditor ? "true" : "false"}
      style={
        {
          "--page-bg": theme.bg,
          "--page-avatar-bg": theme.avatarBg,
          backgroundColor: isMobilePreview
            ? "var(--color-lighter-grey)"
            : undefined,
        } as React.CSSProperties
      }
    >
      <div className={styles.inner}>
        <aside className={styles.sidebarSlot}>{sidebar}</aside>
        <section className={styles.contentSlot}>{content}</section>
      </div>

      {footer && <footer className={styles.footerSlot}>{footer}</footer>}
    </main>
  );
}
