import { createClient } from "@supabase/supabase-js";

async function claimTestUsername() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;
  const username = process.env.TEST_USERNAME;

  if (!supabaseUrl || !supabaseKey || !email || !password || !username) {
    console.error("Missing environment variables. Please check .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`Logging in as ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error("Login failed:", authError.message);
    if (authError.message.includes("Email not confirmed")) {
        console.log("IMPORTANT: You must manually confirm the user in Supabase Dashboard first.");
    }
    process.exit(1);
  }

  const user = authData.user!;
  console.log(`Logged in as user ${user.id}.`);

  console.log(`Checking if username "${username}" is already claimed...`);
  const { data: existingUsername } = await supabase
    .from("usernames")
    .select("uid")
    .eq("username", username)
    .maybeSingle();

  if (existingUsername) {
    if (existingUsername.uid === user.id) {
      console.log(`Username "${username}" is already claimed by this user correctly.`);
      return;
    } else {
      console.error(`Username "${username}" is already claimed by another user (${existingUsername.uid}).`);
      process.exit(1);
    }
  }

  console.log(`Claiming username "${username}"...`);
  
  // 1. Insert into usernames
  const { error: uError } = await supabase.from("usernames").insert({
    username,
    uid: user.id
  });
  if (uError) {
    console.error("Error inserting into usernames:", uError.message);
    process.exit(1);
  }

  // 2. Upsert profile
  const { error: pError } = await supabase.from("profiles").upsert({
    id: user.id,
    username
  });
  if (pError) {
    console.error("Error upserting profile:", pError.message);
    process.exit(1);
  }

  // 3. Upsert page
  const { error: pgError } = await supabase.from("pages").upsert({
    username,
    uid: user.id,
    published: true,
    background: "page-bg-1",
    sidebar_position: "left"
  });
  if (pgError) {
    console.error("Error upserting page:", pgError.message);
    process.exit(1);
  }

  // 4. Update user metadata
  await supabase.auth.updateUser({ data: { username } });

  console.log(`Username "${username}" claimed successfully!`);
}

claimTestUsername();
