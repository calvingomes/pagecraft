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

  // Use the Supabase client's own storage key so it always matches what the browser client reads
  const storageKey = (supabase.auth as unknown as { storageKey: string }).storageKey;
  console.log(`Using storage key for session: ${storageKey}`);
  
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

  // Ensure the test user has a page row (in case onboarding was skipped)
  await supabase.from("pages").upsert(
    {
      username,
      uid: data.user!.id,
      published: true,
      background: "page-bg-1",
      sidebar_position: "left",
    },
    { onConflict: "username" },
  );

  // Ensure the test user has at least one block so view-page tests find content
  const { data: existingBlocks } = await supabase
    .from("blocks")
    .select("id")
    .eq("page_username", username)
    .limit(1);

  if (!existingBlocks || existingBlocks.length === 0) {
    await supabase.from("blocks").insert([
      {
        id: crypto.randomUUID(),
        page_username: username,
        uid: data.user!.id,
        viewport_mode: "desktop",
        type: "text",
        order: 0,
        content: { text: `<p>Hi, I'm ${username} 👋</p>` },
        layout: { x: 0, y: 0 },
      },
      {
        id: crypto.randomUUID(),
        page_username: username,
        uid: data.user!.id,
        viewport_mode: "desktop",
        type: "link",
        order: 1,
        content: { url: "https://example.com", title: "My Website" },
        layout: { x: 1, y: 0 },
      },
    ]);
    console.log(`Created starter blocks for ${username}`);
  }

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
