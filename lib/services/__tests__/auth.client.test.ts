import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { AuthService } from "../auth.client";
import { supabase } from "@/lib/supabase/client";

// Mock Supabase - Inlined to avoid hoisting issues and ensure auth support
vi.mock("@/lib/supabase/client", () => {
  const mock = {
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  };

  const chainable = ["from", "select", "eq"] as const;
  chainable.forEach((method) => {
    mock[method]?.mockReturnValue?.(mock);
  });

  return { supabase: mock };
});

type SupabaseMock = {
  from: Mock;
  select: Mock;
  eq: Mock;
  maybeSingle: Mock;
  auth: {
    getSession: Mock;
    getUser: Mock;
    signInWithOAuth: Mock;
    signOut: Mock;
    updateUser: Mock;
    onAuthStateChange: Mock;
  };
};
const asMock = (fn: unknown) => fn as Mock;
const s = supabase as unknown as SupabaseMock;

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup chain for those that were mocked
    asMock(supabase.from).mockReturnValue(supabase);
    asMock(s.select).mockReturnValue(supabase);
    asMock(s.eq).mockReturnValue(supabase);
  });

  describe("getSession", () => {
    it("returns session and user", async () => {
      const mockSession = { user: { id: "123" } };
      asMock(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await AuthService.getSession();
      expect(result.session).toEqual(mockSession);
      expect(result.user).toEqual(mockSession.user);
    });
  });

  describe("getUser (with self-healing)", () => {
    it("returns user if username is already in metadata", async () => {
      const mockUser = { id: "123", user_metadata: { username: "calvin" } };
      asMock(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await AuthService.getUser();
      expect(result).toEqual(mockUser);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("self-heals username from database if missing in metadata", async () => {
      const mockUser = { id: "123", user_metadata: {} }; // No username
      asMock(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock DB check
      asMock(s.maybeSingle).mockResolvedValue({
        data: { username: "db-name" },
        error: null,
      });

      // Mock metadata sync
      const updatedUser = {
        ...mockUser,
        user_metadata: { username: "db-name" },
      };
      asMock(supabase.auth.updateUser).mockResolvedValue({
        data: { user: updatedUser },
        error: null,
      });

      const result = await AuthService.getUser();

      expect(supabase.from).toHaveBeenCalledWith("usernames");
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: { username: "db-name" },
      });
      expect(result?.user_metadata.username).toBe("db-name");
    });
  });

  describe("signInWithOAuth", () => {
    it("constructs correct redirectTo URL without username", async () => {
      // Mock window.location
      const originalLocation = window.location;
      Object.defineProperty(window, "location", {
        configurable: true,
        value: { ...originalLocation, origin: "http://localhost:3000" },
      });

      await AuthService.signInWithOAuth("google");

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            redirectTo: "http://localhost:3000/auth",
          }),
        }),
      );

      Object.defineProperty(window, "location", {
        configurable: true,
        value: originalLocation,
      });
    });

    it("constructs correct redirectTo URL with username", async () => {
      const originalLocation = window.location;
      Object.defineProperty(window, "location", {
        configurable: true,
        value: { ...originalLocation, origin: "http://localhost:3000" },
      });

      await AuthService.signInWithOAuth("github", "newuser");

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            redirectTo: "http://localhost:3000/auth?username=newuser",
          }),
        }),
      );

      Object.defineProperty(window, "location", {
        configurable: true,
        value: originalLocation,
      });
    });
  });

  describe("signOut", () => {
    it("calls supabase.auth.signOut", async () => {
      await AuthService.signOut();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});
