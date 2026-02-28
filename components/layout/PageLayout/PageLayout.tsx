import type { ReactNode } from "react";
import type { PageBackgroundId } from "@/types/page";
import styles from "./PageLayout.module.css";

type PageLayoutProps = {
  children: ReactNode;
  background?: PageBackgroundId;
};

export function PageLayout({ children, background = "page-bg-1" }: PageLayoutProps) {
  return (
    <main className={styles.pageLayout} data-bg={background}>
      {children}
    </main>
  );
}
