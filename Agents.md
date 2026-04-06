# PageCraft — Coding Instructions

These guidelines define how code should be written and organized in this project.
Follow them when adding features, fixing bugs, or refactoring.

---

## 1. Project Overview

PageCraft is a "link-in-bio" style page builder that allows users to create a single-page profile with draggable blocks (text, links, images). It features a dual-viewport system where users can customize their layout independently for Desktop and Mobile views.

### Core Concepts

- **Viewport-Aware Unified Block Model**: Blocks are stored as one array. Desktop uses `layout/styles`; mobile uses `mobileLayout/mobileStyles`; visibility is per viewport via `visibility.desktop|mobile`.
  - **Desktop**: 4-column React Grid Layout canvas.
  - **Mobile**: 2-column React Grid Layout canvas with scaled preview support.
- **Editor vs. View Mode**:
  - **Editor** (`/editor`): Uses `zustand` store, `react-grid-layout`, and Tiptap editors.
  - **View Page** (`/[username]`): Server Component fetches data via `ServerPageService`, passes to `PageView` (Client Component). Renders using a zero-dependency `ReadOnlyGrid` and code-split lightweight versions of all blocks. No stores, no heavy libraries (Tiptap/RGL) in the visitor's bundle. Pure React props.

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Package Manager**: Bun (Use `bun install`, `bun run dev`, etc.)
- **State Management**: Zustand (`editor-store`, `auth-store`)
- **Database & Auth**: Supabase (via `lib/services/`)
- **Core Logic**: `lib/editor-engine/` (Grid, Layout, Normalization)
- **Styling**: CSS Modules with PostCSS (using CSS variables for theming)
- **Drag & Drop**: react-grid-layout
- **Rich Text**: Tiptap (Headless wrapper around ProseMirror)
- **UI Primitives**: Radix UI (Dialog, Popover, Toolbar, Toggle Group, Radio Group, Label, Slot)
- **Icons**: Lucide React
- **Image Processing**: browser-image-compression (client-side WebP conversion)

---

## 2. Project Structure

```
types/          — All shared TypeScript types (no runtime code)
lib/
  editor-engine/ — Core editor logic (grid math, collision, normalization, RGL adapters)
    grid/        — Grid configuration and math
    layout/      — Placement/collision helpers
    rgl/         — Block ↔ ReactGridLayout conversion helpers
    data/        — Block normalization and viewport logic
  services/      — Data access layer (Supabase wrappers)
    auth.client.ts
    page.client.ts
    block.client.ts
    page.server.ts
  supabase/      — Supabase client factories
    client.ts    — Client-side singleton
    server.ts    — Server-side client factory
  uploads/       — Image processing and storage
  utils/         — Pure utility functions (was helper/)
stores/         — Zustand stores (thin — types live in types/)
contexts/       — React contexts (thin — types live in types/)
hooks/          — Shared React hooks (not tied to a single component)
components/
  blocks/       — Visual block components (TextBlock, LinkBlock, ImageBlock, SectionTitleBlock)
  builder/      — Editor infrastructure (canvas, toolbars, dnd, registry)
  layout/       — Page-level layout shells (Navbar, PageLayout, ProfileSidebar)
  ui/           — Generic reusable UI primitives (Button, etc.)
  views/        — Full-page view compositions (AuthView, HomeLanding, PageView)
app/            — Next.js App Router pages and API routes
styles/         — Global CSS custom properties and media queries
```

---

## 3. Type Definitions

- **All shared types live in `types/`.**  
  Do not define types inline in stores, contexts, hooks, or lib files unless they are truly private to that file's implementation (e.g., a local helper type used nowhere else).

- **One file per domain:**
  - `types/editor.ts` — Block types (`TextBlock`, `LinkBlock`, `ImageBlock`, `SectionTitleBlock`), `Block` union, `BlockType`, `BlockWidthPreset`, `BlockViewportMode`, `EditorState`, `EditorContextValue`, `LinkMetadataResponse`
  - `types/grid.ts` — Grid geometry and config (`GridConfig`, `GridLayout`, `GridRect`, `PlacedRect`, `LayoutById`, `CompactResult`)
  - `types/page.ts` — Page-level enums (`PageBackgroundId`, `SidebarPosition`, `AvatarShape`, `ViewportMode`, `PreviewViewport`)
  - `types/builder.ts` — Builder/component props (`BlockCanvasProps`, `BlockCanvasRenderMode`, `BlockDimensions`, `SortableBlockProps`)
  - `types/auth.ts` — Auth store shape (`AuthStore`)
  - `types/uploads.ts` — Upload/image processing options (`WebpOptions`)

- **Component-specific prop types** can live in a co-located `*.types.ts` file (e.g., `ProfileSidebar.types.ts`, `BlockHoverToolbar.types.ts`, `Toolbar.types.ts`).

- **Re-export** when a type was previously exported from a non-type file and external consumers depend on it:
  ```ts
  export type { LayoutById } from "@/types/grid";
  ```

---

## 4. CSS Modules

- **Use CSS Modules per feature/folder** and keep styles local. Sibling files can share a module when they are one composed control (e.g. toolbar variants).
- Use CSS custom properties from `styles/colors.css` and `styles/media.css` — never hardcode colors or breakpoints that are already defined as variables.
- **Delete dead CSS immediately.** If a class is no longer referenced in the component, remove it. Do not leave commented-out rules.
- **No duplicate selectors** across files. If two components need the same style, extract it to a shared module or use CSS custom properties.
- **Shared Module Linting**: If a shared module is intentional across sibling components (e.g., View/Editor split), add `/* eslint-disable css-modules/no-unused-class */` to the top of BOTH files to satisfy linting while maintaining style colocation.
- **Avoid `composes` keyword** for cross-file composition. Import the style object in JS and concatenate class names:
  ```tsx
  import styles from "./Section.module.css";
  // ...
  className={`${layoutStyles.container} ${styles.container}`}
  ```
- Use `@import "@styles/media.css"` at the top of any module that needs responsive breakpoints.
- **No comments in CSS files.** Keep them clean and purely functional.

### Breakpoint Ranges

- Desktop view: `1360px` and above
- Tablet view: `960px` to `1359px`
- Mobile view: below `960px`

### Dynamic Theming & Contrast

- **Automated Contrast**: Use the `deriveTextColor(bgColor)` utility from `@/lib/utils/colorUtils` to determine if text should be black or white.
- **Variable Injection**: `SortableBlock` injects `--block-bg-color` and `--block-text-color` into the block's scope. Child components should use these variables instead of hardcoded colors to remain theme-aware.
- **Interactive States**: Use `color-mix(in srgb, var(--block-bg-color), black 12%)` for focus/active states in the editor. This ensures the interactive feedback is always proportional to the block's current theme.

---

## 5. Grid System Constants

Grid logic is centralized in `lib/editor-engine/` and parameterized via `GridConfig` objects.

### GridConfig Type (`types/grid.ts`)

```ts
type GridConfig = {
  cols: number; // number of columns
  cellPx: number; // base cell size in pixels
  gapXPx: number; // horizontal gap between cells
  gapYPx: number; // vertical gap between cells
  canvasPx: number; // total canvas width
  rowScale: number; // sub-row precision multiplier (e.g. 2 = half-row units)
  subRowPx: number; // sub-row content height (CSS grid-auto-rows)
  subRowGapPx: number; // sub-row vertical gap
};
```

### Viewport Grid Configs

| Field         | `DESKTOP_GRID` | `MOBILE_GRID` |
| ------------- | -------------- | ------------- |
| `cols`        | 4              | 2             |
| `cellPx`      | 175            | 170           |
| `gapXPx`      | 35             | 30            |
| `gapYPx`      | 35             | 30            |
| `canvasPx`    | 805            | 370           |
| `rowScale`    | 2              | 2             |
| `subRowPx`    | 70             | 70            |
| `subRowGapPx` | 35             | 30            |

Configs are exported from `lib/editor-engine/grid/grid-config.ts`. All code should access grid values via `DESKTOP_GRID.*` or `MOBILE_GRID.*` property access.

### BlockWidthPreset Reference (Desktop)

- `small` → `200×200`
- `wide` → `425×200`
- `skinnyWide` → `425×90` (half-row height preset)
- `max` → `875×200`
- `tall` → `200×425`
- `large` → `425×425`
- `full` → `875×100`

On mobile (2 cols), presets wider than 2 spans are clamped to `config.cols` via `Math.min(w, config.cols)`.

Current product behavior:

- `skinnyWide` is supported in grid/layout logic, but the resize toolbar should show it only for `text` and `link` blocks.
- `max` is supported in grid/layout logic, but the resize toolbar should show it only for `text` blocks on desktop and should be hidden on mobile.

### Grid Functions (all accept optional `config: GridConfig = DESKTOP_GRID`)

**Located in `lib/editor-engine/grid/grid-math.ts`:**

- `spansForPreset(preset, config?)` → `{ w, h }` column/row spans (width clamped to `config.cols`)
- `spansForBlock(block, overridePreset?, config?)` → block-aware spans
- `sizePxForPreset(preset, config?)` → `{ widthPx, heightPx }` derived pixel sizes
- `sizePxForBlock(block, config?)` → block-aware pixel dimensions (`BlockDimensions`)
- `rectForBlock(block, layout?, config?)` → full `GridRect` geometry
- `blockToStyle(block, config?)` → converts grid rect to CSS absolute positioning (`transform: translate3d(...)`) for library-free rendering.

**Located in `lib/editor-engine/layout/collision.ts`:**

- `canPlaceBlockAt(block, at, placed, config?)` — bounds + collision check
- `findFirstFreeSpot(block, placed, config?)` — first available grid position

**Located in `lib/editor-engine/grid/occupancy.ts`:**

- `OccupancyGrid` class — O(1) spatial map for tracking filled sub-rows on the canvas.

**Located in `lib/editor-engine/rgl/`:**

- `blockToRglItem(block, config)` — block → RGL `{ i, x, y, w, h }`
- `rglLayoutToBlockUpdates(newLayout, snapshot, config)` — RGL diff → persisted `{ id, x, y }` updates

**Do / Don't**

- **Do:** Keep block components focused on UI + editor events; call shared layout helpers from `lib/editor-engine`.
- **Do:** Pass the appropriate `GridConfig` (`DESKTOP_GRID` or `MOBILE_GRID`) when calling grid functions from viewport-specific code.
- **Do:** Compute `BlockDimensions` in the parent canvas and pass as props — blocks should not call `sizePxForBlock` internally.
- **Do:** Keep visual block height based on normalized content height; use quantized height for occupancy/reflow decisions.
- **Do:** Use RGL `draggableHandle=".drag-handle"` so text editing/buttons do not trigger drags.
- **Do:** Keep `isResizable={false}` in RGL; width changes come only from toolbar presets.
- **Do:** Keep `compactType="vertical"` in RGL (compaction vertical) unless product behavior changes.
- **Don't:** Add per-block collision or compaction loops directly inside component files.
- **Don't:** Hardcode grid math (`0.5`, `200`, `25`, etc.) outside `lib/editor-engine`.
- **Don't:** Import `MOBILE_GRID` in desktop-specific components or vice versa — keep viewport concerns separated at the component layer.

---

## 6. Components

### General Rules

- **`"use client"` only where needed** — interactive components with hooks, event handlers, or browser APIs.
- **Default export for pages**, named exports for all other components.
- **Props**: define in a co-located `*.types.ts` for non-trivial prop shapes; inline for simple components (< 5 props).
- Avoid `React.FC` — use plain function declarations or arrow functions with explicit prop types.
- Prefer early returns over nested ternaries for conditional rendering.

### Block Components (`components/blocks/`)

Each block type has its own folder. Most blocks follow a split pattern between the view component and its rich editor:

```
blocks/TextBlock/
  TextBlock.tsx       — Lean entry point (renders static HTML)
  TextBlockEditor.tsx — Rich editor (dynamically loaded via next/dynamic)
  TextBlock.module.css

blocks/LinkBlock/
  LinkBlock.tsx        — Entry point
  LinkTitleEditor.tsx  — Tiptap title editor (dynamic)
  LinkImageEditor.tsx  — Image upload/preview editor (dynamic)
  LinkBlock.module.css
```

- Access editor capabilities via `useEditorContext()` — returns `null` in view mode.
- Check `!!editor` to determine editability. Do not pass an `editable` prop separately.
- **Component Splitting**: For blocks with heavy editor dependencies (Tiptap) or complex editor UI (LinkBlock), split the component into a `*Block.tsx` (view) and one or more `*Editor.tsx` components. Load these editor components using `next/dynamic` with `{ ssr: false }` inside the view component's `if (editable)` block.
- **Use the `useBlockEditor` hook** for all Tiptap editor instances (`TextBlock`, `LinkBlock`, `ProfileSidebar`). Do not implement `useEditor` manually.
- **Use the `useLinkMetadata` hook** for link metadata fetching logic.

### Builder Components (`components/builder/`)

- `BlockRegistry/blockRegistry.tsx` is the single map from `BlockType → ReactNode`. When adding a new block type, add it here and in `types/editor.ts` — the `BlockRenderer` will pick it up automatically.
- **`BlockCanvas`** is the top-level canvas entry point. It dispatches between `EditableBlockCanvas` (editor, backed by `editor-store`) and `ReadOnlyGrid` (view page, pure props). It uses `next/dynamic` to load heavy RGL-based canvases only during editing sessions.
- **`ReadOnlyGrid`**: High-performance, library-free alternative to RGL for public views. It positions blocks using absolute CSS via `blockToStyle` and `rectForBlock` to ensure zero layout shift and minimal JS payload.
- **Canvas sub-components** are split by viewport:
  - `BlockCanvas/desktop/DesktopBlockCanvas.tsx` — desktop React Grid Layout canvas for both editable and readonly modes. Uses `blockToRglItem` + `rglLayoutToBlockUpdates`.
  - `BlockCanvas/mobile/MobileBlockCanvas.tsx` — thin wrapper selecting editable or readonly `MobileCanvasGrid`
  - `BlockCanvas/mobile/MobileCanvasGrid.tsx` — mobile React Grid Layout canvas. Uses projected mobile fields (`mobileLayout/mobileStyles`), `transformScale`, and the same update/persist pattern as desktop.
- **Readonly canvas paths must never import `editor-store` or drag hooks.**
- `SortableBlock` is a grid item shell (content + hover toolbar + drag-handle class). It no longer uses dnd-kit.
- Programmatic resize remains preset-based via hover toolbar. It updates width preset only; RGL repacks layout.
- `BlockHoverToolbar` uses a shared preset list and viewport-aware filtering. `max` stays available in desktop editor only; mobile editor hides `max`.
- Hover toolbar background toggle: only `text` and `link` blocks should show the `BG` toggle control.
- Wrapper background state is persisted in `block.styles.transparentWrapper` and rendered via `SortableBlock.module.css` `.emptyWrapper`.
- `sectionTitle` should use transparent wrapper styling only in **view mode** (not editor mode), via the same shared wrapper decision path.
- `sectionTitle` size is `config.canvasPx × config.subRowPx` (desktop: `805×70`, mobile: `370×70`) and occupies **half-row grid height** (`h = 0.5`) to avoid dead space below.

### UI Stacking & Elevation

- **Baseline Stacking**: All RGL items have `z-index: 1` to create a clean baseline.
- **Active Elevation**: Hovered or focused blocks are elevated to `z-index: 100` via `SortableBlock.module.css` to ensure hover toolbars and popovers are never obscured by neighboring blocks.
- **Portal Usage**: Always use `Popover.Portal` for toolbars to ensure they render at the top of the document's stacking context.

### Editor Architecture & Viewport Modes (`app/editor/page.tsx`)

- **Unlocked Viewports**: The editor is accessible at any width. No artificial blocks on mobile/tablet.
- **Dynamic Editor Selection**:
  - **`DesktopEditor`**: Active on screens `>=960px`. Designed for mouse/keyboard.
  - **`MobileEditor`**: Active on screens `<960px`. Designed for touch.
- **Shared Layout, Unique Interaction**: Both editors use `MOBILE_GRID` geometry for mobile views.
  - **Desktop**: Relies on mouse-hover for toolbars.
  - **Mobile**: Uses a **1st tap to select / 2nd tap to focus** model.
- Within the desktop editor, keep the **desktop/mobile preview toggle** enabled so users can edit and preview the mobile layout from desktop.
- `PageLayout` exposes `previewViewport` (`"desktop" | "mobile"`) and `framedMobilePreview` (boolean): editor passes `framedMobilePreview={true}` for the framed mobile preview, while view pages keep it `false` for clean public mobile layout.
- In mobile preview mode, only page content is previewed (`ProfileSidebar` + `BlockCanvas`); editor chrome (save/signout buttons, preview toggle, bottom toolbar) remains outside the preview frame.
- Mobile preview frame is sized from `MOBILE_GRID.canvasPx` (currently `370px`) and intentionally styled (frame/background) to make preview boundaries explicit.
- Sticky sidebar styling is viewport-driven: sticky only when `data-preview="desktop"` and sidebar is not `center`.
- Profile positioning is a desktop-only editing feature in the editor UI.
- View page tablet mode should keep desktop-like layout behavior but render profile at the top (`center` sidebar position).

---

## 7. State Management & Data Services

- **Data Services** (`lib/services/`) handle all Supabase interactions.
  - `auth.client.ts`: Client-side auth operations.
  - `page.client.ts`: Client-side page fetching/claiming.
  - `block.client.ts`: Client-side block operations.
  - `page.server.ts`: Server-side page data fetching.
- **Supabase Clients** (`lib/supabase/`)
  - `client.ts`: Exports `supabase` singleton for client components.
  - `server.ts`: Exports `createSupabaseServerClient` for server components.
- **Zustand stores** hold transient editor and auth state.
  - `editor-store.ts` — unified `blocks` array, `activeViewportMode`, and block mutation actions. Exports `selectActiveViewportBlocks` selector.
  - `auth-store.ts` — auth/user state.
- Store files should be thin — just `create<StoreType>()(...)` with the type imported from `types/`.
- Derived/computed values can use Zustand selectors in components.
- **EditorContext** provides `onUpdateBlock` and `onRemoveBlock` to block components so they don't import the store directly.
- **View pages (`/[username]`) must not use any Zustand store.** The server component fetches unified blocks using `ServerPageService` (`lib/services/page.server.ts`) and passes `blocks` to `PageView`. The client `PageView` component projects blocks for the active viewport via `useViewportMode()` — no store hydration needed.

---

## 8. File & Image Uploads

- All image processing flows through `lib/uploads/`:
  - `imageProcessing.ts` — low-level WebP conversion using `browser-image-compression`
  - `imageWebp.ts` — high-level helpers (`toWebpFile`, `fileToWebpDataUrl`, `dataUrlToWebpFile`)
  - `pageImageStorage.ts` — Supabase Storage upload/delete with `.webp` paths
- The shared `WebpOptions` type lives in `types/uploads.ts`.
- Always convert to WebP before uploading. Use `.webp` file extensions in storage paths.
- **Image Optimization (SEO)**:
  - Use Next.js `Image` for all assets hosted on internal/Supabase domains (e.g., Profile Avatars).
  - Use standard `<img>` for external user-provided links (e.g., LinkBlock previews) where domain whitelisting in `next.config.ts` is not feasible. Add `// eslint-disable-next-line @next/next/no-img-element` to justify usage.

---

## 9. Code Style

- **No duplicate logic.** If a function exists in `lib/`, use it. Check before writing new utilities.
- **Imports**: use `@/` path aliases. Group: external → `@/types` → `@/lib` → `@/stores` → `@/contexts` → `@/components` → relative.
- **No barrel files** (`index.ts` re-exports). Import directly from the source file.
- Prefer `const` arrow functions for components: `export const MyComponent = (props: Props) => { ... }`.
- Use `type` imports (`import type { ... }`) for types that don't need runtime presence.
- Keep files focused: one primary export per file. If a file grows beyond ~200 lines, consider splitting.

---

## 10. Naming Conventions

| Item             | Convention            | Example                         |
| ---------------- | --------------------- | ------------------------------- |
| Components       | PascalCase            | `TextBlock`, `BlockCanvas`      |
| Component files  | PascalCase.tsx        | `TextBlock.tsx`                 |
| CSS modules      | PascalCase.module.css | `TextBlock.module.css`          |
| Type files       | camelCase.ts          | `editor.ts`, `grid.ts`          |
| Lib/helper files | camelCase.ts          | `blockGrid.ts`, `htmlToText.ts` |
| Store files      | kebab-case.ts         | `editor-store.ts`               |
| Hooks            | camelCase.ts          | `useAuthGuard.ts`               |
| CSS class names  | camelCase             | `.blockContent`, `.heroCard`    |
| Type names       | PascalCase            | `BlockWidthPreset`, `GridRect`  |

---

## 11. Viewport-Aware Block System

Blocks are stored as a unified list and rendered per viewport mode (`"desktop"` | `"mobile"`).

### Database

- The `blocks` table has a `viewport_mode` column.
- Current persistence stores editor blocks with `viewport_mode: "desktop"` as the row anchor.
- Mobile-specific layout/style/visibility data is stored alongside each block (`mobileLayout`, `mobileStyles`, `visibility`) inside the JSON shape.

### Editor Flow

- Editor loads all blocks in a single query and hydrates `editor-store` via `setAllBlocks(blocks)`.
- `activeViewportMode` in the store is synced to the editor's preview toggle.
- Block mutations update unified block objects (desktop fields or mobile fields depending on the edit context).
- Save (`lib/editor/saveEditorPage.ts`) upserts unified block rows and deletes stale rows.

### View Page Flow

- `app/[username]/page.tsx` (server component) fetches all blocks in one query and passes unified `blocks` to `PageView`.
- `PageView` (client component) uses `useViewportMode()` to project each block to the active viewport and derive `visibleBlocks` + `renderMode` — **no store, no hydration**.
- `PageView` passes `previewViewport={renderMode}` into `PageLayout`, and leaves `framedMobilePreview` as default `false` so public mobile pages keep clean layout styling.
- `BlockCanvas` receives `renderMode` and delegates to the correct canvas without re-detecting viewport.

---

## 12. Adding a New Block Type

1. Add the interface to `types/editor.ts` and include it in the `Block` union.
2. Add the `type` string to `BlockType`.
3. Create `components/blocks/YourBlock/YourBlock.tsx` + `YourBlock.module.css`.
4. Register it in `components/builder/BlockRegistry/blockRegistry.tsx`.
5. Add span defaults in `lib/editor-engine/grid/grid-math.ts` → `spansForPreset` (if it uses a new preset).
6. Handle creation in `app/editor/page.tsx` toolbar action.
7. Handle normalization in `lib/editor-engine/data/normalization.ts` → `normalizeStoredBlocks`.
8. If the block has viewport-specific rendering, handle it in both `DesktopBlockCanvas` and `MobileCanvasGrid`.

---

## 13. Radix UI Usage

- Prefer Radix primitives for interactive UI controls (dialogs, popovers, toolbars, segmented controls) while preserving current visuals.
- Keep class names and module structure stable when migrating to Radix; behavior/accessibility should improve without layout redesign.
- Use `Popover.Portal` / `Dialog.Portal` for layered UI. Avoid manual document/body scroll-lock logic when Radix already handles it.
- For toolbar-attached popovers, keep trigger geometry stable while open. Do not apply hover transforms to active popover triggers.
- For palette-style popovers that should match trigger container size, set width from the toolbar container and keep inner palette wrapper at `width: 100%`.
- If overlay is open in editor, hide or blur editor chrome (save/signout/toggles/toolbar) through a single wrapper state instead of z-index fights across independent stacking contexts.
- For visually hidden labels, prefer the shared `lib/utils/visuallyHidden.ts` style constant over duplicating `.visuallyHidden` classes across CSS modules.
