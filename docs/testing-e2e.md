# E2E Testing Contract (Local + PR)

This project uses one Playwright suite for both:
- local development against local Supabase
- PR checks against the Supabase project configured in CI secrets

## Goal

Keep a single set of tests and make environment differences purely configuration-driven.

## Required Environment Variables

Local (`.env.local`):
- `NEXT_PUBLIC_SITE_URL` (usually `http://localhost:3000`)
- `NEXT_PUBLIC_SUPABASE_URL` (local `http://127.0.0.1:54321` or remote)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`
- `TEST_EMAIL`
- `TEST_PASSWORD`
- optional: `TEST_USERNAME` (fallback is derived in global setup)

CI (`.github/workflows/e2e.yml`):
- same variables must be provided via secrets

## Test User Contract

The E2E user must:
- exist and be able to sign in with `TEST_EMAIL` / `TEST_PASSWORD`
- have a valid username (in auth metadata or `usernames` table)
- have RLS permissions required by editor/view flows

`tests/e2e/global-setup.ts` handles:
- login
- username fallback/sync from `usernames`
- auth storage state creation in `playwright/.auth/user.json`
- `playwright/.auth/test-user.json` generation
- lightweight page/block bootstrap when needed

## Cross-Environment Invariants

To keep tests portable between local and CI/prod-backed checks:
- do not hardcode Supabase hostnames in assertions
- allow local and cloud storage URLs in checks
- keep schema + RLS policies in sync between environments
- use deterministic selectors (`data-*`) over CSS class name heuristics

## Image + Local Supabase Note

When local Supabase is used (`127.0.0.1` / `localhost`), Next Image needs local remote image allowance. This is handled in `next.config.ts` by:
- deriving protocol/host/port from `NEXT_PUBLIC_SUPABASE_URL`
- enabling local IP image loading for local Supabase hosts

## Run Commands

- Unit tests: `bun run test`
- E2E tests: `bun run test:e2e`
- Single spec: `bunx playwright test tests/e2e/<file>.spec.ts --project=chromium`

## Troubleshooting Checklist

If `/editor` tests fail early:
- verify `TEST_EMAIL` / `TEST_PASSWORD`
- verify user has username
- verify Supabase URL/key point to intended environment
- check browser console for `next/image` host errors

If E2E passes but logs are noisy:
- external analytics/resource errors are non-blocking unless tests explicitly assert on them
