import { supabase } from "@/lib/supabase/client";
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
   * Includes self-healing logic to sync username from DB if missing in metadata.
   */
  getUser: async (): Promise<User | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Self-healing: If metadata is missing username, check the database
    if (!user.user_metadata?.username) {
      const { data: usernameData } = await supabase
        .from("usernames")
        .select("username")
        .eq("uid", user.id)
        .maybeSingle();

      if (usernameData?.username) {
        // Sync back to metadata for future sessions
        const { data: updatedUser } = await supabase.auth.updateUser({
          data: { username: usernameData.username },
        });
        return updatedUser.user;
      }
    }

    return user;
  },

  /**
   * Sign in with an OAuth provider
   */
  signInWithOAuth: async (provider: "google" | "github" | "figma", username?: string) => {
    let redirectTo = `${window.location.origin}/auth`;
    if (username) {
      redirectTo += `?username=${encodeURIComponent(username)}`;
    }

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: {
          prompt: "select_account",
        },
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
