import type { User } from "@supabase/supabase-js";

export type AuthStore = {
  user: User | null;
  username: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setUsername: (username: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
};
