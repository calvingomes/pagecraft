import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PageCraft",
  description: "A single page profile builder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
