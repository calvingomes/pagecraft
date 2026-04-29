import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import { PHProvider } from "./providers";
import { PostHogPageView } from "./PostHogPageView";
import { SmoothScroll } from "@/components/layout/SmoothScroll";

const geist = localFont({
  src: [
    {
      path: "./fonts/geist-v4-latin-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/geist-v4-latin-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/geist-v4-latin-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/geist-v4-latin-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-geist",
});

const fraunces = localFont({
  src: [
    {
      path: "./fonts/fraunces-v38-latin-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/fraunces-v38-latin-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/fraunces-v38-latin-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/fraunces-v38-latin-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-fraunces",
});

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
    <html lang="en" className={`${geist.variable} ${fraunces.variable}`}>
      <body>
        <PHProvider>
          <SmoothScroll>
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>
            {children}
          </SmoothScroll>
        </PHProvider>
      </body>
    </html>
  );
}
