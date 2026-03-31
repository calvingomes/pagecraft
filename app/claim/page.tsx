"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuthStore } from "@/stores/auth-store";
import { AuthService } from "@/lib/services/auth.client";
import { PageService } from "@/lib/services/page.client";
import { BlockService } from "@/lib/services/block.client";
import { PageLoader } from "@/components/ui/PageLoader/PageLoader";

/**
 * Normalize username:
 * - lowercase
 * - trim
 * - allow only a–z and 0–9
 */
const normalizeUsername = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");

export default function ClaimPage() {
  const router = useRouter();
  const { authChecked } = useAuthGuard("claim");
  const setUsernameInStore = useAuthStore((s) => s.setUsername);

  const [username, setUsername] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [claiming, setClaiming] = useState(false);

  /**
   * Live username availability check (debounced)
   */
  useEffect(() => {
    if (!username || username.length < 3) {
      setAvailable(null);
      return;
    }

    const checkAvailability = async () => {
      setChecking(true);
      const isAvailable = await PageService.checkUsernameAvailability(username);
      setAvailable(isAvailable);
      setChecking(false);
    };

    const timeout = setTimeout(checkAvailability, 400);
    return () => clearTimeout(timeout);
  }, [username]);

  /**
   * Claim username (atomic)
   */
  const claimUsername = async () => {
    const user = await AuthService.getUser();
    if (!user || !available || claiming) return;

    setClaiming(true);

    try {
      await PageService.claimUsername(username, user.id);
      await BlockService.createStarterBlocks(username, user.id);
      await AuthService.updateUserMetadata({ username });

      setUsernameInStore(username);

      router.push("/editor");
    } finally {
      setClaiming(false);
    }
  };

  if (!authChecked) {
    return <PageLoader />;
  }

  return (
    <main>
      <h1>Claim your username</h1>

      <input
        value={username}
        onChange={(e) => setUsername(normalizeUsername(e.target.value))}
        placeholder="enter your username"
      />

      {checking && <p>Checking...</p>}
      {available === true && <p>✅ Available</p>}
      {available === false && <p>❌ Taken</p>}

      <button disabled={!available || claiming} onClick={claimUsername}>
        {claiming ? "Claiming..." : "Claim & Continue"}
      </button>
    </main>
  );
}
