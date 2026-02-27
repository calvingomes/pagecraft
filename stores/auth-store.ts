import { create } from "zustand";
import { User } from "firebase/auth";

type AuthStore = {
  user: User | null;
  username: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setUsername: (username: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  username: null,
  loading: true,
  setUser: (user) => set({ user }),
  setUsername: (username) => set({ username }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null, username: null }),
}));
