import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

async function globalSetup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const email = process.env.TEST_EMAIL!;
  const password = process.env.TEST_PASSWORD!;
  const siteUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`Logging in as ${email}...`);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to login for global setup: ${error.message}`);
  }

  const session = data.session;
  if (!session) {
    throw new Error("No session returned after successful login.");
  }

  let username =
    typeof data.user?.user_metadata?.username === "string"
      ? data.user.user_metadata.username.trim()
      : "";

  if (!username) {
    const { data: usernameData } = await supabase
      .from("usernames")
      .select("username")
      .eq("uid", data.user?.id ?? "")
      .maybeSingle();

    if (typeof usernameData?.username === "string" && usernameData.username.trim()) {
      username = usernameData.username.trim();
      await supabase.auth.updateUser({ data: { username } });
    }
  }

  if (!username) {
    throw new Error(
      "E2E user has no username in metadata or usernames table. Create/claim one before running editor tests.",
    );
  }
  process.env.TEST_USERNAME = process.env.TEST_USERNAME || username;

  // Extract project ID from Supabase URL (e.g., https://[project-id].supabase.co)
  const projectId = supabaseUrl.match(/https:\/\/(.*?)\.supabase/)?.[1];
  if (!projectId) {
    throw new Error("Could not extract project ID from Supabase URL.");
  }

  const storageKey = `sb-${projectId}-auth-token`;
  
  // Format for Playwright storageState
  const storageState = {
    cookies: [],
    origins: [
      {
        origin: siteUrl,
        localStorage: [
          {
            name: storageKey,
            value: JSON.stringify(session),
          },
        ],
      },
    ],
  };

  const authDir = path.join(process.cwd(), "playwright", ".auth");
  fs.mkdirSync(authDir, { recursive: true });
  const storageStatePath = path.join(authDir, "user.json");
  fs.writeFileSync(storageStatePath, JSON.stringify(storageState, null, 2));
  fs.writeFileSync(
    path.join(authDir, "test-user.json"),
    JSON.stringify({ username }, null, 2),
  );
  console.log(`Session saved to ${storageStatePath}`);
}

export default globalSetup;
