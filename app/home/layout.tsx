import type { Metadata } from "next";
import styles from "./home.module.css";

import { Navbar } from "@/components/layout/Navbar/Navbar";

export const metadata: Metadata = {
  title: "Home | PageCraft",
  description:
    "Build and share a beautiful single-page profile with PageCraft.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className={styles.homeViewport}>
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
