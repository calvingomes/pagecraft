import { createClient } from "@supabase/supabase-js";

async function createTestUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

  if (!supabaseUrl || !supabaseKey || !email || !password) {
    console.error("Missing environment variables. Please check .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`Checking if user ${email} exists...`);
  const { data: signInData } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInData.user) {
    console.log("Test user already exists and is confirmed. skipping creation.");
    return;
  }

  console.log(`Attempting to create user ${email}...`);
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    console.error("Error creating user:", signUpError.message);
    if (signUpError.message.includes("User already registered")) {
        console.log("User exists but might not be confirmed. Check Supabase dashboard.");
    }
    process.exit(1);
  }

  console.log("User created successfully!");
  console.log("IMPORTANT: If email confirmation is enabled in your Supabase project, you must manually confirm this user once in the Supabase Dashboard > Authentication > Users.");
}

createTestUser();
