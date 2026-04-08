import { HomeLanding } from "@/components/views/HomeLanding/HomeLanding";
import { Navbar } from "@/components/layout/Navbar/Navbar";

export default function HomePage() {
  return (
    <>
      <Navbar
        cta={{ label: "Sign up", href: "/auth" }}
        transparentOnMobile={true}
      />
      <HomeLanding />
    </>
  );
}
