import { createClient } from "npm:@supabase/supabase-js@2";

type FeedbackRecord = {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
};

type WebhookPayload = {
  type?: string;
  table?: string;
  schema?: string;
  record?: FeedbackRecord;
  old_record?: FeedbackRecord | null;
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
const feedbackToEmail = Deno.env.get("FEEDBACK_TO_EMAIL") ?? "";
const feedbackFromEmail = Deno.env.get("FEEDBACK_FROM_EMAIL") ?? "PageCraft <onboarding@resend.dev>";
const webhookSecret = Deno.env.get("WEBHOOK_SHARED_SECRET") ?? "";

if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !feedbackToEmail) {
  throw new Error("Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, FEEDBACK_TO_EMAIL");
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const verifyWebhookSecret = (req: Request): boolean => {
  if (!webhookSecret) return true;
  const header = req.headers.get("x-webhook-secret") ?? req.headers.get("authorization");
  if (!header) return false;
  if (header === webhookSecret) return true;
  if (header === `Bearer ${webhookSecret}`) return true;
  return false;
};

const getUsername = async (userId: string): Promise<string | null> => {
  const { data, error } = await admin
    .from("usernames")
    .select("username")
    .eq("uid", userId)
    .maybeSingle();

  if (error) {
    console.error("[feedback-email] username lookup failed", error);
    return null;
  }

  return typeof data?.username === "string" ? data.username : null;
};

const sendMail = async (input: {
  username: string;
  userId: string;
  message: string;
  createdAt: string;
  feedbackId: string;
}) => {
  const subject = `Feedback from @${input.username}`;
  const text = [
    `New PageCraft feedback`,
    ``,
    `Username: @${input.username}`,
    `User ID: ${input.userId}`,
    `Feedback ID: ${input.feedbackId}`,
    `Created At: ${input.createdAt}`,
    ``,
    `Message:`,
    input.message,
  ].join("\n");

  const html = `
    <h2>New PageCraft feedback</h2>
    <p><strong>Username:</strong> @${input.username}</p>
    <p><strong>User ID:</strong> ${input.userId}</p>
    <p><strong>Feedback ID:</strong> ${input.feedbackId}</p>
    <p><strong>Created At:</strong> ${input.createdAt}</p>
    <hr />
    <p>${input.message.replace(/\n/g, "<br />")}</p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: feedbackFromEmail,
      to: [feedbackToEmail],
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend failed (${res.status}): ${body}`);
  }
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!verifyWebhookSecret(req)) {
    return json({ error: "Unauthorized webhook" }, 401);
  }

  let payload: WebhookPayload;
  try {
    payload = (await req.json()) as WebhookPayload;
  } catch {
    return json({ error: "Invalid JSON payload" }, 400);
  }

  const record = payload.record;
  if (!record?.user_id || !record?.message || !record?.id || !record?.created_at) {
    return json({ error: "Missing feedback payload fields" }, 400);
  }

  try {
    const username = (await getUsername(record.user_id)) ?? "unknown";
    await sendMail({
      username,
      userId: record.user_id,
      message: record.message,
      createdAt: record.created_at,
      feedbackId: record.id,
    });
    return json({ ok: true });
  } catch (error) {
    console.error("[feedback-email] failed:", error);
    return json({ error: "Failed to send feedback email" }, 500);
  }
});
