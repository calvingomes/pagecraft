# PageCraft

A link-in-bio builder for creators. Compose a single-page profile by snapping reusable blocks — text, links, hero images, titles — into a responsive canvas. Edit desktop and mobile layouts independently, then publish a fast, shareable page in one click.

## Features

- **Dual viewport editing** — desktop and mobile layouts are edited separately but stay in sync through a shared block grid
- **Block-based content** — add blocks per viewport; each canvas manages its own layout independently while sharing the same underlying content
- **Drag, resize, preview** — drag-handle controls, live viewport switching, and real-time save feedback keep the editing experience fluid
- **Fast public pages** — published profiles are server-rendered and optimised for sharing

## Roadmap

- Live analytics per published page
- Access-controlled embeds
- Advanced layout presets
- Custom domain support

## Getting started

```bash
bun install
bun run dev
```

Sign in and open `http://localhost:3000/editor` to build your profile. Published pages are available at `http://localhost:3000/[username]`.

> Requires a Supabase project. Copy `.env.example` to `.env.local` and fill in your credentials before running. The database schema is available at `schema.sql` — run it in the Supabase SQL editor to set up your tables.

## Stack

- **Framework** — Next.js (App Router)
- **Drag and drop** — `@dnd-kit`
- **Database / auth** — Supabase
- **Package manager** — Bun

Editor logic lives in `app/editor` and `components/builder`. Grid layout math is handled by `lib/editor-engine`. Public pages are served through `ServerPageService → PageView`, keeping view mode lean and dependency-free.