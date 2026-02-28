import type { ReactNode } from "react";
import styles from "./PageLayout.module.css";

type PageLayoutProps = {
  children: ReactNode;
};

export function PageLayout({ children }: PageLayoutProps) {
  return <main className={styles.pageLayout}>{children}</main>;
}
