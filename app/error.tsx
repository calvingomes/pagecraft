"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { ErrorState } from "@/components/ui/ErrorState/ErrorState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

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
      />
      <main style={{ padding: "0 24px" }}>
        <ErrorState
          title="Something went wrong"
          description="An unexpected error occurred. We've been notified and are looking into it."
          cta={{
            label: "Try again",
            onClick: () => reset(),
          }}
        />
      </main>
    </>
  );
}
