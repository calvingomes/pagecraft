import { createClient } from "@supabase/supabase-js";

/**
 * Creates a fresh Supabase client for server-side use.
 * In a standard Next.js / Supabase setup, this would use 
 * `@supabase/ssr` to handle cookies, but for this project's
 * simple public data fetching, a basic client works.
 */
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createClient(supabaseUrl, supabaseKey);
}
