import { create } from "zustand";
import type { AuthStore } from "@/types/auth";

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  username: null,
  loading: true,
  setUser: (user) => set({ user }),
  setUsername: (username) => set({ username }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null, username: null }),
}));
