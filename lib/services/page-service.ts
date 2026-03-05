import { supabase } from "@/lib/supabase";
import type {
  AvatarShape,
  PageBackgroundId,
  SidebarPosition,
} from "@/types/page";

export interface PageData {
  title?: string;
  background?: PageBackgroundId;
  sidebar_position?: SidebarPosition;
  display_name?: string;
  bio_html?: string;
  avatar_url?: string;
  avatar_shape?: AvatarShape;
}

export const PageService = {
  /**
   * Check if a username is available
   */
  checkUsernameAvailability: async (username: string): Promise<boolean> => {
    const { data } = await supabase
      .from("usernames")
      .select("username")
      .eq("username", username)
      .maybeSingle();
    return !data;
  },

  /**
   * Claim a username and initialize user profile/page
   */
  claimUsername: async (username: string, userId: string) => {
    // 1. Insert into usernames table
    const { error: usernameError } = await supabase.from("usernames").insert({
      username,
      uid: userId,
    });
    if (usernameError) throw usernameError;

    // 2. Upsert profile
    const { error: profileError } = await supabase.from("profiles").upsert(
      { id: userId, username },
      { onConflict: "id" },
    );
    if (profileError) throw profileError;

    // 3. Upsert page
    const { error: pageError } = await supabase.from("pages").upsert(
      {
        username,
        uid: userId,
        published: true,
        background: "page-bg-1",
        sidebar_position: "left",
      },
      { onConflict: "username" },
    );
    if (pageError) throw pageError;
  },

  /**
   * Get page data by username
   */
  getPageByUsername: async (username: string) => {
    const { data } = await supabase
      .from("pages")
      .select(
        "title, background, sidebar_position, display_name, bio_html, avatar_url, avatar_shape",
      )
      .eq("username", username)
      .maybeSingle();
    return data as PageData | null;
  },
};
