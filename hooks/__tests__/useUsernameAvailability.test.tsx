import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUsernameAvailability } from "../useUsernameAvailability";
import { supabase } from "@/lib/supabase/client";
import type { Mock } from "vitest";

// Mock Supabase
vi.mock("@/lib/supabase/client", () => {
  const mock = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
  };
  return { supabase: mock };
});

type SupabaseMock = {
  from: Mock;
  select: Mock;
  eq: Mock;
  maybeSingle: Mock;
};
const s = supabase as unknown as SupabaseMock;

describe("useUsernameAvailability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it("should return 'idle' for short usernames", () => {
    const { result } = renderHook(() => useUsernameAvailability("ca"));
    expect(result.current).toBe("idle");
  });

  it("should reach 'checking' state for names >= 3 chars", async () => {
    const { result } = renderHook(({ name }) => useUsernameAvailability(name), {
      initialProps: { name: "cal" }
    });
    
    expect(result.current).toBe("checking");
  });

  it("should debouncing and return 'available' if no user exists", async () => {
    s.maybeSingle.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useUsernameAvailability("calvin"));
    
    expect(result.current).toBe("checking");

    // Fast-forward debounce
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(supabase.from).toHaveBeenCalledWith("pages");
    expect(result.current).toBe("available");
  });

  it("should return 'taken' if user exists", async () => {
    s.maybeSingle.mockResolvedValue({ data: { username: "calvin" }, error: null });

    const { result } = renderHook(() => useUsernameAvailability("calvin"));
    
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("taken");
  });

  it("should handle errors", async () => {
    s.maybeSingle.mockResolvedValue({ data: null, error: new Error("DB Error") });

    const { result } = renderHook(() => useUsernameAvailability("calvin"));
    
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("error");
  });
});
