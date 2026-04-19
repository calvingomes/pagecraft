import { HomeLanding } from "@/components/views/HomeLanding/HomeLanding";
import { Navbar } from "@/components/layout/Navbar/Navbar";

export default function HomePage() {
  return (
    <>
      <Navbar
        cta={{ label: "Get PageCraft free", href: "/auth?mode=signup" }}
        links={[
          { label: "How it works", href: "/#how-it-works" },
          { label: "Features", href: "/#features" },
          { label: "Login", href: "/auth?mode=signin" },
        ]}
        transparentOnMobile={true}
      />
      <HomeLanding />
    </>
  );
}
