import { renderHook, waitFor } from "@testing-library/react";
import { useAuthGuard } from "../useAuthGuard";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/services/auth.client";
import { useAuthStore } from "@/stores/auth-store";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { User } from "@supabase/supabase-js";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock AuthService
vi.mock("@/lib/services/auth.client", () => ({
  AuthService: {
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
}));

// Mock useAuthStore
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: vi.fn(),
}));

describe("useAuthGuard", () => {
  const mockPush = vi.fn();
  const mockReplace = vi.fn();
  const mockSetUser = vi.fn();
  const mockSetUsername = vi.fn();
  const mockSetLoading = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    });

    vi.mocked(useAuthStore).mockImplementation((selector) => {
      const state = {
        user: null,
        username: null,
        loading: true,
        setUser: mockSetUser,
        setUsername: mockSetUsername,
        setLoading: mockSetLoading,
        logout: vi.fn(),
      };
      return selector(state);
    });

    // Default mock implementation for getUser
    vi.mocked(AuthService.getUser).mockResolvedValue(null);
  });

  it("should redirect logged-out users to /auth when in editor mode", async () => {
    vi.mocked(AuthService.getUser).mockResolvedValue(null);

    renderHook(() => useAuthGuard("editor"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/auth");
    });
  });

  it("should NOT redirect logged-out users when in auth mode", async () => {
    vi.mocked(AuthService.getUser).mockResolvedValue(null);

    const { result } = renderHook(() => useAuthGuard("auth"));

    await waitFor(() => {
      expect(result.current.authChecked).toBe(true);
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  it("should redirect logged-in users with a username to /editor when in auth mode", async () => {
    const mockUser = {
      id: "user-123",
      user_metadata: { username: "calvin" },
    } as unknown as User;
    vi.mocked(AuthService.getUser).mockResolvedValue(mockUser);

    renderHook(() => useAuthGuard("auth"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/editor");
    });
  });

  it("should allow logged-in users WITHOUT a username to stay on /auth", async () => {
    const mockUser = {
      id: "user-123",
      user_metadata: {}, // No username
    } as unknown as User;
    vi.mocked(AuthService.getUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuthGuard("auth"));

    await waitFor(() => {
      expect(result.current.authChecked).toBe(true);
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  it("should redirect logged-in users WITHOUT a username back to /auth if they try to access editor", async () => {
    const mockUser = {
      id: "user-123",
      user_metadata: {}, // No username
    } as unknown as User;
    vi.mocked(AuthService.getUser).mockResolvedValue(mockUser);

    renderHook(() => useAuthGuard("editor"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/auth");
    });
  });

  it("should handle the 'Old User' scenario: ignore ?username= in URL if user already has a name", async () => {
    // Setup URL search params mock
    const originalLocation = window.location;
    // @ts-expect-error - Mocking window.location is intentional
    delete (window as { location?: Location }).location;
    window.location = {
      ...originalLocation,
      search: "?username=claimed-name",
      origin: "https://example.com",
    };

    const mockUser = {
      id: "user-123",
      user_metadata: { username: "actual-name" },
    } as unknown as User;
    vi.mocked(AuthService.getUser).mockResolvedValue(mockUser);

    renderHook(() => useAuthGuard("auth"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/editor");
    });

    // Cleanup
    window.location = originalLocation;
  });
});
