"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuthStore } from "@/stores/auth-store";

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
      const { data } = await supabase
        .from("usernames")
        .select("username")
        .eq("username", username)
        .maybeSingle();
      setAvailable(!data);
      setChecking(false);
    };

    const timeout = setTimeout(checkAvailability, 400);
    return () => clearTimeout(timeout);
  }, [username]);

  /**
   * Claim username (atomic)
   */
  const claimUsername = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !available || claiming) return;

    setClaiming(true);

    try {
      const { error: usernameError } = await supabase.from("usernames").insert({
        username,
        uid: user.id,
      });

      if (usernameError) {
        throw usernameError;
      }

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          username,
        },
        { onConflict: "id" },
      );

      if (profileError) {
        throw profileError;
      }

      const { error: pageError } = await supabase.from("pages").upsert(
        {
          username,
          uid: user.id,
          published: true,
          background: "page-bg-1",
          sidebar_position: "left",
        },
        { onConflict: "username" },
      );

      if (pageError) {
        throw pageError;
      }

      const starterBlocks = [
        {
          id: crypto.randomUUID(),
          page_username: username,
          uid: user.id,
          type: "text",
          order: 0,
          content: {
            text: `<p>Hi, I'm ${username} 👋</p>`,
          },
          layout: { x: 0, y: 0 },
        },
        {
          id: crypto.randomUUID(),
          page_username: username,
          uid: user.id,
          type: "link",
          order: 1,
          content: {
            url: "https://example.com",
            title: "My Website",
          },
          layout: { x: 1, y: 0 },
        },
      ];

      const { error: blockError } = await supabase
        .from("blocks")
        .insert(starterBlocks);

      if (blockError) {
        throw blockError;
      }

      await supabase.auth.updateUser({
        data: { username },
      });

      setUsernameInStore(username);

      router.push("/editor");
    } finally {
      setClaiming(false);
    }
  };

  if (!authChecked) {
    return <div>Loading...</div>;
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
