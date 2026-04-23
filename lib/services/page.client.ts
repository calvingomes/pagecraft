import { supabase } from "@/lib/supabase/client";
import type {
  AvatarShape,
  PageBackgroundId,
  SidebarPosition,
} from "@/types/page";
import { isReservedUsername } from "@/lib/utils/reservedUsernames";

export interface PageData {
  uid?: string;
  title?: string;
  background?: PageBackgroundId;
  sidebar_position?: SidebarPosition;
  display_name?: string;
  bio_html?: string;
  avatar_url?: string;
  avatar_shape?: AvatarShape;
  og_image_url?: string;
  updated_at?: string;
}

export const PageService = {
  /**
   * Check if a username is available
   */
  checkUsernameAvailability: async (username: string): Promise<boolean> => {
    // 1. Check reserved list
    if (isReservedUsername(username)) {
      return false;
    }

    // 2. Check database
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
    // 0. Final safety check for reserved usernames
    if (isReservedUsername(username)) {
      throw new Error(`The username "${username}" is reserved and cannot be claimed.`);
    }

    // 1. Check if username is already claimed
    const { data: existingUsername } = await supabase
      .from("usernames")
      .select("uid")
      .eq("username", username)
      .maybeSingle();

    if (existingUsername) {
      if (existingUsername.uid !== userId) {
        throw new Error(`The username "${username}" is already taken.`);
      }
      // If it's ours, we just continue to ensure profile/page are created
    } else {
      // 2. Insert into usernames table if it doesn't exist
      const { error: usernameError } = await supabase.from("usernames").insert({
        username,
        uid: userId,
      });
      if (usernameError) throw usernameError;
    }

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
        background: "page-bg-2",
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
