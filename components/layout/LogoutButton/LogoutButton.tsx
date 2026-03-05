"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { AuthService } from "@/lib/services/auth.client";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/Button/Button";

export function LogoutButton() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await AuthService.signOut();
    logout();
    router.replace("/auth");
  };

  return (
    <Button
      variant="secondary"
      onClick={handleLogout}
      rightIcon={<ArrowRight size={18} />}
    >
      Sign out
    </Button>
  );
}
