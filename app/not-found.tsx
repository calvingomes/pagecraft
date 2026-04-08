import { Navbar } from "@/components/layout/Navbar/Navbar";
import { ErrorState } from "@/components/ui/ErrorState/ErrorState";

export default function GlobalNotFound() {
  return (
    <>
      <Navbar
        cta={{ label: "Sign up", href: "/auth" }}
        logoColor="var(--color-forest-green)"
      />
      <main style={{ padding: "0 24px" }}>
        <ErrorState
          title="404"
          description="Looks like this page got lost."
          cta={{
            label: "Go back home",
            href: "/",
          }}
        />
      </main>
    </>
  );
}
