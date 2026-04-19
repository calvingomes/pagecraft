# feedback-email Edge Function

Sends an email notification for every new `public.feedback` row.

## Required Secrets

Set these in Supabase project secrets for Edge Functions:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `FEEDBACK_TO_EMAIL`
- `FEEDBACK_FROM_EMAIL` (optional; defaults to `onboarding@resend.dev`)
- `WEBHOOK_SHARED_SECRET` (recommended)

## Deploy

```bash
supabase functions deploy feedback-email
```

## Database Webhook Setup

Create a Supabase Database Webhook:

- Table: `public.feedback`
- Events: `INSERT`
- HTTP URL: `https://<project-ref>.functions.supabase.co/feedback-email`
- Method: `POST`
- Header: `x-webhook-secret: <WEBHOOK_SHARED_SECRET>`

Payload should include the inserted `record`.
