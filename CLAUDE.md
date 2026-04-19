# CLAUDE.md

This file provides the operational overview for PageCraft, focusing on commands, environment setup, and testing.

> [!TIP]
> **Coding Rules & Constants**: For layout math, naming conventions, and project rules, refer to [Agents.md](Agents.md). To add a new block type, follow the 8-step guide in [NEW_BLOCK.md](NEW_BLOCK.md).

## Commands

```bash
bun run dev      # Start dev server (http://localhost:3000)
bun run build    # Production build
bun run start    # Start production server
bun run lint     # Run ESLint
bun run test     # Run Vitest suite (pre-commit gate)
bun run test:e2e # Run Playwright E2E suite
```

**Setup**: Copy `.env.example` to `.env.local` with Supabase credentials. Ensure Supabase CLI is running (`supabase start`).

---

## Architecture Overview

**PageCraft** is a block-based "link-in-bio" builder that allows users to create single-page profiles with draggable blocks (text, links, images).

- **Dual-Viewport Layout**: Users can customize their layout **independently** for Desktop and Mobile views using a "Viewport-Aware Unified Block Model." 
- **Modular Block Architecture**: Uses a plugin-based `ActionRegistry` for block-specific tools and a centralized `blockRegistry` for dynamic rendering.
- **Editor vs. View**: The editor (`/editor`) uses Zustand + RGL + Tiptap. The public view page (`/[username]`) uses a high-performance, zero-dependency `ReadOnlyGrid`.
- **Settings Feedback**: `/settings` uses static block-like cards. Feedback inserts into `public.feedback`; email delivery is handled by Supabase Edge Function `feedback-email` via Resend.

---

## Testing Strategy

### Unit Tests (Vitest)
- Co-located in `__tests__` directories (e.g., `*.test.ts`).
- **Pre-commit**: Husky blocks commits if lint or unit tests fail.
- Supabase is mocked via `createSupabaseChainMock` in `vitest.setup.ts`.

### E2E Tests (Playwright)
- Tests live in `tests/e2e/`.
- Auth state is cached in `playwright/.auth/user.json`.
- Uses a dedicated test user for local/CI environments to bypass Google OAuth.
- Keep feedback E2E tests non-sending (validation paths) to avoid triggering real feedback emails.

### E2E Authentication
Playwright's global setup (`global-setup.ts`) handles the auth handshake:
1. Signs in via `supabase.auth.signInWithPassword()`.
2. Writes the session to `playwright/.auth/user.json`.
3. Sets `storageState` to this JSON for all editor-scoped tests.

**Do not** test Google OAuth itself; it is an external dependency.

### Key E2E User Flows
1. **Editor Integrity**: Loads correctly for authenticated users.
2. **Persistence**: Add/Delete block → Save → View Page verification.
3. **Images**: Upload → WebP conversion → Render check.
4. **Previews**: Desktop/Mobile toggle in editor.
5. **Security**: Unauthenticated redirects.
6. **Settings Feedback (Safe)**: Validation flow at `/settings` without DB insert/email side effects.
