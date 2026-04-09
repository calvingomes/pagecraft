# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev      # Start dev server (http://localhost:3000)
bun run build    # Production build
bun run start    # Start production server
npm run lint     # Run ESLint
bun run test     # Run Vitest suite (pre-commit gate)
```

**Setup**: Copy `.env.example` to `.env.local` with Supabase credentials. Run `schema.sql` in Supabase SQL editor.

## Architecture Overview

PageCraft is a link-in-bio page builder. Users drag blocks (text, links, images, section titles) onto a canvas with independent desktop and mobile layouts.

### Two Modes

- **Editor** (`/editor`): Unlocked for all viewports.
  - **DesktopEditor** (`>=960px`): Mouse-based, includes mobile preview frame.
  - **MobileEditor** (`<960px`): Touch-optimized 1-tap select / 2-tap focus model with floating `MobileBlockToolbar`.
  - Both use Zustand + RGL + Tiptap.
- **View Page** (`/[username]`): Server Component fetches data via `ServerPageService`, passes unified blocks to `PageView`. No stores, no RGL — pure props.
- **Error Handling**: 
  - `app/error.tsx`: Global render/client error boundary.
  - `app/not-found.tsx`: Global 404.
  - `app/[username]/not-found.tsx`: Profile-specific "Claim yours" 404.
  - `ErrorState.tsx`: Unified UI for all errors.

### Viewport-Aware Unified Block Model

Blocks are one array. `layout/styles` → desktop; `mobileLayout/mobileStyles` → mobile; `visibility.desktop|mobile` → per-viewport. All mutations must call `ensureBlocksHaveValidLayoutsForAllViewports()` from `lib/editor-engine/data/normalization.ts` to ensure non-overlapping safety.

### Testing Strategy

The project uses **Vitest** + **jsdom**.
- `bun run test`: Run suite once.
- `bun run test:watch`: Development mode.
- **Pre-commit**: Husky runs lint + tests. Commits fail if tests fail.
- **Targets**: Grid math (`grid-math.ts`) and layout safety (`normalization.ts`).

### Analytics

PostHog is used for strictly anonymous tracking (`persistence: 'memory'`).
- **Path**: Manual events are documented in `app/providers.tsx`.
- **Pattern**: Pass `trackingEvent="event_name"` to `ThemeButton`. This bridges Server Components to the PostHog capture in the Client Component.
- **Identification**: Do **NOT** use `posthog.identify()`. Anonymity is mandatory.

### Editor Engine (`lib/editor-engine/`)

The core grid/collision system. All grid constants come from `DESKTOP_GRID` / `MOBILE_GRID` in `lib/editor-engine/grid/grid-config.ts`.

- **Desktop**: 4 cols, 175px cells, 35px gaps, 805px canvas
- **Mobile**: 2 cols, 170px cells, 30px gaps, 370px canvas
- Both use `rowScale: 2` (half-row sub-divisions)

Key functions:
- `spansForPreset(preset, config?)` / `sizePxForBlock(block, config?)` — `lib/editor-engine/grid/grid-math.ts`
- `canPlaceBlockAt()` / `findFirstFreeSpot()` — `lib/editor-engine/layout/collision.ts`
- `blockToRglItem(block, config)` / `rglLayoutToBlockUpdates(newLayout, snapshot, config)` — `lib/editor-engine/rgl/`

Never hardcode grid values (`175`, `35`, etc.) outside `lib/editor-engine`.

### Canvas Components (`components/builder/BlockCanvas/`)

`BlockCanvas` dispatches between editable (store-backed) and readonly (props-only) paths. Readonly canvas paths must never import `editor-store` or drag hooks.

- `desktop/DesktopBlockCanvas.tsx` — 4-col RGL, handles drag-stop → `rglLayoutToBlockUpdates`
- `mobile/MobileCanvasGrid.tsx` — 2-col RGL with `transformScale`, projects `mobileLayout/mobileStyles`
- `SortableBlock` — grid item shell with drag handle, hover toolbar, delete button
- `BlockRegistry/blockRegistry.tsx` — single map from `BlockType → ReactNode`

RGL is always `isResizable={false}`, `compactType="vertical"`, `draggableHandle=".drag-handle"`.

### State Management

- `editor-store.ts` — unified blocks array, `activeViewportMode`, block mutations
- `auth-store.ts` — user/username/loading
- `EditorContext` — injects `onUpdateBlock` / `onRemoveBlock` callbacks into block components so they don't import the store directly

Store files are thin — types live in `types/`.

### Services (`lib/services/`)

All Supabase calls are wrapped here. `page.server.ts` is server-only; the rest are client-side.

## Adding a New Block Type

1. Add interface to `types/editor.ts`, include in `Block` union and `BlockType`
2. Create `components/blocks/YourBlock/YourBlock.tsx` + `YourBlock.module.css`
3. Register in `components/builder/BlockRegistry/blockRegistry.tsx`
4. Add span defaults in `lib/editor-engine/grid/grid-math.ts` → `spansForPreset`
5. Handle creation in `app/editor/page.tsx` toolbar action
6. Handle normalization in `lib/editor-engine/data/normalization.ts` → `normalizeStoredBlocks` (ensure `widthPreset: "full"` for sections)
7. Handle viewport-specific rendering in both `DesktopBlockCanvas` and `MobileCanvasGrid`

## Code Style & Conventions

**Imports**: use `@/` path aliases. Order: external → `@/types` → `@/lib` → `@/stores` → `@/contexts` → `@/components` → relative. No barrel files (`index.ts`). Import `type` for type-only imports.

**Components**: `"use client"` only where needed. Prefer `const` arrow functions. Avoid `React.FC`. Early returns over nested ternaries.

**Naming**:
- Components/files: `PascalCase.tsx`
- CSS modules: `PascalCase.module.css`, class names `camelCase`
- Stores: `kebab-case.ts`; Hooks/lib/types: `camelCase.ts`

**CSS Modules**: Use variables from `styles/colors.css` and `styles/media.css`. No hardcoded colors or breakpoints. No dead CSS classes. `@import "@styles/media.css"` at top of any module needing breakpoints. Breakpoints: desktop ≥1360px, tablet 960–1359px, mobile <960px.

**Types**: All shared types in `types/` — one file per domain. Component-specific prop types can go in co-located `*.types.ts`. No inline type definitions in stores/lib/hooks unless truly private.

**Theming**: `SortableBlock` injects `--block-bg-color` and `--block-text-color` into scope. Block children use these variables. Use `deriveTextColor(bgColor)` from `@/lib/utils/colorUtils` for automated contrast. `Navbar` supports `logoColor` and `textColor` overrides for theme-specific branding.

**Layout**: `PageLayout` uses `isEditor` flag to apply `data-is-editor` attribute for specific spacing (e.g., increased bottom padding for toolbar clearance).

**BlockWidthPreset quirks**:
- `skinnyWide` toolbar only for `text` and `link` blocks
- `max` toolbar only for `text` blocks on desktop (hide on mobile)
- `sectionTitle` transparent wrapper only in view mode, not editor mode
- `full` blocks are always full-width (`h = 0.5`); `sectionTitle` is `config.canvasPx × config.subRowPx`

## File Uploads

All image flows go through `lib/uploads/`. Always convert to WebP before uploading (`toWebpFile` / `fileToWebpDataUrl`). Use `.webp` extensions in Supabase Storage paths.
