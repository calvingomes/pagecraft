import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../auth-store";
import type { User } from "@supabase/supabase-js";

describe("auth-store", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    useAuthStore.getState().setLoading(true);
  });

  it("should have initial loading state", () => {
    expect(useAuthStore.getState().loading).toBe(true);
    expect(useAuthStore.getState().user).toBe(null);
  });

  it("should update user state", () => {
    const mockUser = { id: "123", email: "test@test.com" } as User;
    useAuthStore.getState().setUser(mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);
  });

  it("should update username state", () => {
    useAuthStore.getState().setUsername("calvin");
    expect(useAuthStore.getState().username).toBe("calvin");
  });

  it("should handle logout correctly", () => {
    useAuthStore.getState().setUser({ id: "123" } as User);
    useAuthStore.getState().setUsername("calvin");
    
    useAuthStore.getState().logout();
    
    expect(useAuthStore.getState().user).toBe(null);
    expect(useAuthStore.getState().username).toBe(null);
  });

  it("should handle loading toggle", () => {
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().loading).toBe(false);
  });
});
