# PageCraft Project Context

## 1. Overview
PageCraft is a "link-in-bio" style page builder that allows users to create a single-page profile with draggable blocks (text, links, images). It features a dual-viewport system where users can customize their layout independently for Desktop and Mobile views.

## 2. Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand (`editor-store`, `auth-store`)
- **Database & Auth**: Supabase (via `lib/services/`)
- **Core Logic**: `lib/editor-engine/` (Grid, Layout, Normalization)
- **Styling**: CSS Modules with PostCSS (using CSS variables for theming)
- **Drag & Drop**: @dnd-kit (Core, Sortable, Utilities)
- **Rich Text**: Tiptap (Headless wrapper around ProseMirror)
- **Icons**: Lucide React
- **Image Processing**: browser-image-compression (client-side WebP conversion)

## 3. Core Concepts

### Viewport-Aware Block System
Blocks are stored with a `viewport_mode` ('desktop' or 'mobile'). The editor loads both sets but only renders/edits the active one.
- **Desktop**: 4-column grid, free drag-and-drop placement.
- **Mobile**: 2-column grid, free drag-and-drop placement (uses same `useGridDnd` logic as desktop).

### Grid System
- **Desktop**: 4 columns (200px cells), 25px gaps.
- **Mobile**: 2 columns (250px cells), 40px gaps.
- **Logic**: Centralized in `lib/editor-engine/`. Blocks snap to a grid.
- **DnD**: Shared `useGridDnd` hook handles layout, collision, and compaction for both viewports.

### Editor vs. View Mode
- **Editor** (`/editor`): Uses `zustand` stores, `dnd-kit`, and Tiptap editors.
- **View Page** (`/[username]`): Server Component fetches data via `ServerPageService`, passes to `PageView` (Client Component). No stores, no heavy libraries. Pure React props.

---

# Coding Instructions (from AGENTS.md)

## 1. Project Structure

```
types/          — All shared TypeScript types (no runtime code)
lib/
  editor-engine/ — Core editor logic (grid math, layout, collision, normalization)
  services/      — Supabase service wrappers (auth, page, block)
  uploads/       — Image processing and storage
helper/         — Small pure-function helpers (no side-effects, no imports from lib/)
stores/         — Zustand stores (thin — types live in types/)
contexts/       — React contexts (thin — types live in types/)
hooks/          — Shared React hooks (not tied to a single component)
components/
  blocks/       — Visual block components (TextBlock, LinkBlock, ImageBlock, SectionTitleBlock)
  builder/      — Editor infrastructure (canvas, toolbars, dnd, registry)
  layout/       — Page-level layout shells (Header, Navbar, PageLayout, ProfileSidebar)
  ui/           — Generic reusable UI primitives (Button, etc.)
  views/        — Full-page view compositions (AuthView, HomeLanding, PageView)
app/            — Next.js App Router pages and API routes
styles/         — Global CSS custom properties and media queries
```

## 2. Type Definitions

- **All shared types live in `types/`.**
- **One file per domain:**
  - `types/editor.ts` — Block types & Editor state
  - `types/grid.ts` — Grid geometry & config
  - `types/page.ts` — Page-level enums
  - `types/builder.ts` — Builder props
  - `types/auth.ts` — Auth store
  - `types/uploads.ts` — Upload options

## 3. CSS Modules

- **Every component gets its own `*.module.css`**.
- **No global utility classes** (except in `globals.css` reset).
- **ProseMirror overrides** go in `*.prosemirror.css`.
- Use variables from `styles/colors.css`.
- **Avoid `composes` keyword** across files; use JS string concatenation.
- Use `@import "@styles/media.css"` for media queries.

### Breakpoints
- **Desktop**: `>= 1360px`
- **Tablet**: `960px - 1359px`
- **Mobile**: `< 960px`

## 4. Grid System Constants

Grid logic is centralized in `lib/editor-engine/`.

| Field         | `DESKTOP_GRID` | `MOBILE_GRID` |
| ------------- | -------------- | ------------- |
| `cols`        | 4              | 2             |
| `cellPx`      | 200            | 250           |
| `gapXPx`      | 25             | 40            |
| `gapYPx`      | 25             | 15            |
| `canvasPx`    | 875            | 540           |

**Key Rules:**
- Access grid config via `DESKTOP_GRID` or `MOBILE_GRID` imports from `lib/editor-engine/grid/grid-config.ts`.
- Use `snapToCursor` collision detection for DnD.
- Do not hardcode pixel values in components.

## 5. Components

### Block Components
- Located in `components/blocks/`.
- Use `useBlockEditor` for Tiptap instances.
- Use `useLinkMetadata` for fetching link info.
- Access editor state via `useEditorContext()`.

### Builder Components
- `BlockCanvas`: Top-level entry.
- `DesktopBlockCanvas`: Memoized, optimized for 4-col DnD.
- `MobileCanvasGrid`: Optimized for 2-col grid DnD (shared logic with Desktop).
- `BlockRegistry`: Maps `BlockType` string to React Component.

### Editor Preview
- The editor has a **desktop/mobile preview toggle**.
- `PageLayout` handles the preview frame logic (`framedMobilePreview`).
- Viewport logic is in `lib/editor-engine/data/viewport.ts`.

## 6. State Management

- **Zustand** (`editor-store.ts`) manages `desktopBlocks`, `mobileBlocks`, and `activeViewportMode`.
- **EditorContext** provides `onUpdateBlock` to avoid direct store imports in blocks.
- **View Pages** (`app/[username]/page.tsx`) are stateless (Server Components) and do NOT use Zustand.

## 7. File & Image Uploads

- Images are converted to **WebP** client-side before upload.
- Logic in `lib/uploads/`.

## 8. Code Style

- **Imports**: Use `@/` aliases. Group: external → internal types → internal lib → components.
- **No barrel files** (`index.ts`).
- **Functional Components**: Use `const Component = (props) => ...`.
- **Props**: Co-locate `*.types.ts` for complex props.

## 9. Viewport-Aware Block System

- **Database**: `blocks` table has `viewport_mode` column.
- **Save**: Upserts blocks with their mode.
- **Load**: Splits blocks into `desktop` and `mobile` arrays.

## 10. Adding a New Block Type

1. Add interface to `types/editor.ts`.
2. Create component in `components/blocks/`.
3. Register in `components/builder/BlockRegistry/blockRegistry.tsx`.
4. Add span defaults in `lib/editor-engine/grid/grid-math.ts`.
5. Handle toolbar action in `app/editor/page.tsx`.
