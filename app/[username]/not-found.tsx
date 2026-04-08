"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { ErrorState } from "@/components/ui/ErrorState/ErrorState";

export default function ProfileNotFound() {
  const pathname = usePathname();
  const username = pathname?.split("/").pop() || "";

  return (
    <>
      <Navbar
        cta={{ label: "Sign up", href: "/auth" }}
        logoColor="var(--color-forest-green)"
        transparentOnMobile
      />
      <main style={{ padding: "0 24px" }}>
        <ErrorState
          title="This page hasn't been crafted yet"
          description={`The username "${username}" hasn't been claimed yet. Want to make it yours?`}
          cta={{
            label: "Claim this username",
            href: `/auth?username=${username}`,
          }}
        />
      </main>
    </>
  );
}
