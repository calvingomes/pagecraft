import { Children, cloneElement, isValidElement } from "react";
import type { ReactNode } from "react";
import type { PageBackgroundId, SidebarPosition } from "@/types/page";
import styles from "./PageLayout.module.css";

type PageLayoutProps = {
  children: ReactNode;
  background?: PageBackgroundId;
  sidebarPosition?: SidebarPosition;
};

export function PageLayout({
  children,
  background = "page-bg-1",
  sidebarPosition = "left",
}: PageLayoutProps) {
  const childArray = Children.toArray(children);
  const [sidebar, content] = childArray;

  const sidebarWithOrder = isValidElement(sidebar)
    ? cloneElement(sidebar as React.ReactElement<{ position?: SidebarPosition }>, {
        position: sidebarPosition,
      })
    : sidebar;

  const isCenter = sidebarPosition === "center";

  return (
    <main
      className={`${styles.pageLayout} ${isCenter ? styles.pageLayoutCenter : ""}`}
      data-bg={background}
      data-sidebar={sidebarPosition}
    >
      <div
        className={styles.sidebarSlot}
        style={
          isCenter
            ? { order: 0 }
            : { order: sidebarPosition === "left" ? 0 : 1 }
        }
      >
        {sidebarWithOrder}
      </div>
      <div
        className={styles.contentSlot}
        style={
          isCenter
            ? { order: 1 }
            : { order: sidebarPosition === "left" ? 1 : 0 }
        }
      >
        {content}
      </div>
    </main>
  );
}
