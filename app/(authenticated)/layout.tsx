"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { PageLoader } from "@/components/ui/PageLoader/PageLoader";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authChecked } = useAuthGuard("editor");

  if (!authChecked) {
    return (
      <PageLoader label="Validating session..." backgroundColor="var(--color-lighter-grey)" />
    );
  }

  return <>{children}</>;
}
