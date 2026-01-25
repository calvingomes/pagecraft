import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | PageCraft",
  description:
    "Build and share a beautiful single-page profile with PageCraft.",
};

export default function HomePage() {
  return (
    <main>
      <h1>Welcome to PageCraft</h1>
      <h3>Hello, This is the Home page</h3>
    </main>
  );
}
