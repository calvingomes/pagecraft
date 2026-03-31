import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type UsernameStatus = "idle" | "checking" | "available" | "taken" | "error";

/**
 * Hook to check username availability with debouncing.
 */
export function useUsernameAvailability(username: string, debounceMs = 500) {
  const [status, setStatus] = useState<UsernameStatus>("idle");
  const [prevUsername, setPrevUsername] = useState("");

  const trimmed = username.trim();

  // Adjust state during render if the username changed.
  // This is the idiomatic way to handle sync state derivates in React without triggering cascading effect renders.
  if (username !== prevUsername) {
    setPrevUsername(username);
    if (trimmed.length < 3) {
      if (status !== "idle") setStatus("idle");
    } else {
      if (status !== "checking") setStatus("checking");
    }
  }

  useEffect(() => {
    if (trimmed.length < 3) return;

    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from("pages")
          .select("username")
          .eq("username", trimmed)
          .maybeSingle();

        if (error) {
          console.error("Availability check error:", error);
          setStatus("error");
          return;
        }

        setStatus(data ? "taken" : "available");
      } catch (err) {
        console.error("Availability check failed:", err);
        setStatus("error");
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [trimmed, debounceMs]);

  return status;
}
