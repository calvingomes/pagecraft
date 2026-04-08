import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://pagecraft.me"),
  title: "PageCraft | Craft your corner of the web",
  description:
    "PageCraft is a block-based page builder and link-in-bio tool. Drag blocks, arrange your own layout, and publish a page that actually looks like you.",
  icons: {
    icon: "/logo/pagecraft-logo.svg",
    apple: "/logo/pagecraft-logo.png",
  },
  openGraph: {
    title: "PageCraft | Craft your corner of the web",
    description:
      "PageCraft is a block-based page builder and link-in-bio tool. Drag blocks, arrange your own layout, and publish a page that actually looks like you.",
    siteName: "PageCraft",
    type: "website",
    url: "https://pagecraft.me",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PageCraft | Craft your corner of the web",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PageCraft | Craft your corner of the web",
    description:
      "PageCraft is a block-based page builder and link-in-bio tool. Drag blocks, arrange your own layout, and publish a page that actually looks like you.",
    images: ["/og-image.png"],
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
