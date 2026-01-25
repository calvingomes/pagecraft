import type { Metadata } from "next";

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
        <Navbar />
        {children}
      </body>
    </html>
  );
}
