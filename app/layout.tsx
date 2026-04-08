import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PageCraft | Craft your corner of the web",
  description: "Build a page that actually looks like you. Drag blocks, arrange your layout, and publish in one link.",
  icons: {
    icon: "/logo/pagecraft-logo.svg",
    apple: "/logo/pagecraft-logo.png",
  },
  openGraph: {
    title: "PageCraft | Craft your corner of the web",
    description: "Build a page that actually looks like you. Drag blocks, arrange your layout, and publish in one link.",
    siteName: "PageCraft",
    type: "website",
    url: "https://pagecraft.me",
  },
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
