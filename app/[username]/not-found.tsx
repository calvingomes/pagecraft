"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { ErrorState } from "@/components/ui/ErrorState/ErrorState";
import { isReservedUsername } from "@/lib/utils/reservedUsernames";

export default function ProfileNotFound() {
  const pathname = usePathname();
  const username = pathname?.split("/").pop() || "";
  const reserved = isReservedUsername(username);

  return (
    <>
      <Navbar
        cta={{ label: "Get PageCraft free", href: "/auth?mode=signup" }}
        links={[
          { label: "How it works", href: "/#how-it-works" },
          { label: "Features", href: "/#features" },
          { label: "Login", href: "/auth?mode=signin" },
        ]}
        logoColor="var(--color-forest-green)"
        transparentOnMobile
      />
      <main style={{ minHeight: "100vh" }}>
        <ErrorState
          title={reserved ? "404" : "This page hasn't been crafted yet"}
          description={
            reserved
              ? "Looks like this page got lost."
              : `The username "${username}" hasn't been claimed yet. Want to make it yours?`
          }
          cta={
            reserved
              ? {
                  label: "Go back home",
                  href: "/",
                }
              : {
                  label: "Claim this username",
                  href: `/auth?username=${encodeURIComponent(username)}`,
                }
          }
        />
      </main>
    </>
  );
}
