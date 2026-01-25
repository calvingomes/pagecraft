import type { Metadata } from "next";
import { Header } from "@/components/layout/HomePageHeader/Header";

export const metadata: Metadata = {
  title: "Home | PageCraft",
  description:
    "Build and share a beautiful single-page profile with PageCraft.",
};

export default function HomePage() {
  return <Header />;
}
