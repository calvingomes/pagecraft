import { HomeLanding } from "@/components/views/HomeLanding/HomeLanding";
import { Navbar } from "@/components/layout/Navbar/Navbar";

export default function HomePage() {
  return (
    <>
      <Navbar
        links={[{ label: "Updates", href: "/auth", position: "left" }]}
        cta={{ label: "Sign up", href: "/auth" }}
        secondaryCTA={{ label: "Sign in", href: "/auth" }}
      />
      <HomeLanding />
    </>
  );
}
