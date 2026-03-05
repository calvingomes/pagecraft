import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

export const AuthService = {
  /**
   * Get the current user session
   */
  getSession: async (): Promise<{
    session: Session | null;
    user: User | null;
  }> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return { session, user: session?.user ?? null };
  },

  /**
   * Get the current user (directly from auth.getUser)
   */
  getUser: async (): Promise<User | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    await supabase.auth.signOut();
  },

  /**
   * Update user metadata (e.g. username)
   */
  updateUserMetadata: async (data: { username?: string }) => {
    return await supabase.auth.updateUser({ data });
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange: (
    callback: (event: string, session: Session | null) => void,
  ) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};
