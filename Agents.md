# PageCraft — Coding Instructions

These guidelines define how code should be written and organized in this project.
Follow them when adding features, fixing bugs, or refactoring.

---

## 1. Project Overview

PageCraft is a "link-in-bio" style page builder that allows users to create a single-page profile with draggable blocks (text, links, images). It features a dual-viewport system where users can customize their layout independently for Desktop and Mobile views.

### Core Concepts

- **Viewport-Aware Block System**: Blocks are stored with a `viewport_mode` ('desktop' or 'mobile'). The editor loads both sets but only renders/edits the active one.
  - **Desktop**: 4-column grid, free drag-and-drop placement.
  - **Mobile**: 2-column grid, free drag-and-drop placement (uses same `useGridDnd` logic as desktop).
- **Editor vs. View Mode**:
  - **Editor** (`/editor`): Uses `zustand` stores, `dnd-kit`, and Tiptap editors.
  - **View Page** (`/[username]`): Server Component fetches data via `ServerPageService`, passes to `PageView` (Client Component). No stores, no heavy libraries. Pure React props.

### Tech Stack

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

---

## 2. Project Structure

```
types/          — All shared TypeScript types (no runtime code)
lib/
  editor-engine/ — Core editor logic (grid math, layout, collision, normalization)
    grid/        — Grid configuration and math
    layout/      — Drag placement, resizing, collision detection
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

---

## 3. Type Definitions

- **All shared types live in `types/`.**  
  Do not define types inline in stores, contexts, hooks, or lib files unless they are truly private to that file's implementation (e.g., a local helper type used nowhere else).

- **One file per domain:**
  - `types/editor.ts` — Block types (`TextBlock`, `LinkBlock`, `ImageBlock`, `SectionTitleBlock`), `Block` union, `BlockType`, `BlockWidthPreset`, `BlockViewportMode`, `BlocksByViewport`, `EditorState`, `EditorContextValue`, `LinkMetadataResponse`
  - `types/grid.ts` — Grid geometry and config (`GridConfig`, `GridLayout`, `GridRect`, `PlacedRect`, `LayoutById`, `CompactResult`)
  - `types/page.ts` — Page-level enums (`PageBackgroundId`, `SidebarPosition`, `AvatarShape`, `ViewportMode`, `PreviewViewport`)
  - `types/builder.ts` — Builder/component props (`BlockCanvasProps`, `BlockCanvasRenderMode`, `BlockDimensions`, `SortableBlockProps`, DnD snapshot types)
  - `types/auth.ts` — Auth store shape (`AuthStore`)
  - `types/uploads.ts` — Upload/image processing options (`WebpOptions`)

- **Component-specific prop types** can live in a co-located `*.types.ts` file (e.g., `ProfileSidebar.types.ts`, `BlockHoverToolbar.types.ts`, `Toolbar.types.ts`).

- **Re-export** when a type was previously exported from a non-type file and external consumers depend on it:
  ```ts
  export type { LayoutById } from "@/types/grid";
  ```

---

## 4. CSS Modules

- **Every component gets its own `*.module.css`** — no global utility classes.
- **ProseMirror overrides** go in a co-located `*.prosemirror.css` file imported from the module CSS.
- Use CSS custom properties from `styles/colors.css` and `styles/media.css` — never hardcode colors or breakpoints that are already defined as variables.
- **Delete dead CSS immediately.** If a class is no longer referenced in the component, remove it. Do not leave commented-out rules.
- **No duplicate selectors** across files. If two components need the same style, extract it to a shared module or use CSS custom properties.
- **Avoid `composes` keyword** for cross-file composition. Import the style object in JS and concatenate class names:
  ```tsx
  import layoutStyles from "../../LandingLayout.module.css";
  import styles from "./Section.module.css";
  // ...
  className={`${layoutStyles.container} ${styles.container}`}
  ```
- Use `@import "@styles/media.css"` at the top of any module that needs responsive breakpoints.

### Breakpoint Ranges

- Desktop view: `1360px` and above
- Tablet view: `960px` to `1359px`
- Mobile view: below `960px`

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
| `cellPx`      | 200            | 250           |
| `gapXPx`      | 25             | 40            |
| `gapYPx`      | 25             | 15            |
| `canvasPx`    | 875            | 540           |
| `rowScale`    | 2              | 2             |
| `subRowPx`    | 90             | 120           |
| `subRowGapPx` | 25             | 15            |

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

**Located in `lib/editor-engine/layout/collision.ts`:**
- `canPlaceBlockAt(block, at, placed, config?)` — bounds + collision check
- `findFirstFreeSpot(block, placed, config?)` — first available grid position
- `resolveCollisions(anchoredId, layout, preset, blocks, getLayout, config?)` — push all blocks to non-overlapping positions

**Located in `lib/editor-engine/grid/compact.ts`:**
- `compactEmptyRows(blocks, config?)` — remove empty rows

**Located in `lib/editor-engine/layout/drag-placement.ts`:**
- `computeTargetFromOver` — determine grid target from drop event
- `computePushedLayouts` — calculate new layouts during drag

**Do / Don't**

- **Do:** Keep block components focused on UI + editor events; call shared layout helpers from `lib/editor-engine`.
- **Do:** Pass the appropriate `GridConfig` (`DESKTOP_GRID` or `MOBILE_GRID`) when calling grid functions from viewport-specific code.
- **Do:** Compute `BlockDimensions` in the parent canvas and pass as props — blocks should not call `sizePxForBlock` internally.
- **Do:** Keep visual block height based on normalized content height; use quantized height for occupancy/reflow decisions.
- **Do:** Use `snapToCursor` collision detection strategy (from `lib/dndKit.ts`) for all drag-and-drop operations to ensure items snap to the grid cell nearest the pointer.
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

Each block type has its own folder:

```
blocks/TextBlock/
  TextBlock.tsx
  TextBlock.module.css
```

- Access editor capabilities via `useEditorContext()` — returns `null` in view mode.
- Check `!!editor` to determine editability. Do not pass an `editable` prop separately.
- **Use the `useBlockEditor` hook** for all Tiptap editor instances (`TextBlock`, `LinkBlock`, `ProfileSidebar`). Do not implement `useEditor` manually.
- **Use the `useLinkMetadata` hook** for link metadata fetching logic.

### Builder Components (`components/builder/`)

- `BlockRegistry/blockRegistry.tsx` is the single map from `BlockType → ReactNode`. When adding a new block type, add it here and in `types/editor.ts` — the `BlockRenderer` will pick it up automatically.
- **`BlockCanvas`** is the top-level canvas entry point. It dispatches between `EditableBlockCanvas` (editor, backed by `editor-store`) and `ReadonlyBlockCanvas` (view page, pure props). Readonly mode receives a `renderMode` prop (`"desktop" | "mobile"`) from the parent — it never independently detects viewport.
- **Canvas sub-components** are split by viewport:
  - `BlockCanvas/desktop/DesktopBlockCanvas.tsx` — desktop grid with DnD (editable) or `DesktopReadonlyBlock` (readonly). Computes `sizePxForBlock(block)` and passes `dimensions` prop to children. Memoizes expensive layout styles and extracts `DroppableCell` to prevent re-renders.
  - `BlockCanvas/desktop/DesktopReadonlyBlock.tsx` — lightweight readonly block for desktop grid layout. Receives `dimensions: BlockDimensions` as props.
  - `BlockCanvas/mobile/MobileBlockCanvas.tsx` — thin wrapper selecting editable or readonly `MobileCanvasGrid`
  - `BlockCanvas/mobile/MobileCanvasGrid.tsx` — mobile 2-column grid. Uses `useGridDnd` for 2D drag-and-drop placement (similar to Desktop). Uses `MOBILE_GRID` for spans (`spansForBlock(block, undefined, MOBILE_GRID).w`) and pixel sizes (`sizePxForBlock(block, MOBILE_GRID)`).
  - `BlockCanvas/mobile/MobileReadonlyBlock.tsx` — lightweight readonly block for mobile (no editor store or DnD deps). Receives `dimensions: BlockDimensions` as props.
- **Readonly canvas paths must never import `editor-store` or DnD hooks.** Use `DesktopReadonlyBlock` / `MobileReadonlyBlock` for view pages.
- `SortableBlock` wraps each block with drag handles, resize toolbar, and hover detection. It subscribes to `editor-store` — only use in editable paths. Receives `dimensions: BlockDimensions` and optional `gridConfig: GridConfig` as props from the parent canvas — it never calls `sizePxForBlock` internally.
- `useGridDnd` hook (shared) — handles 2D grid collision detection, placement highlighting, and layout compaction for both Desktop and Mobile editors. Consumes logic from `lib/editor-engine`.
- `BlockHoverToolbar` uses a shared preset list and viewport-aware filtering. `max` stays available in desktop editor only; mobile editor hides `max`.
- Hover toolbar background toggle: only `text` and `link` blocks should show the `BG` toggle control.
- Wrapper background state is persisted in `block.styles.transparentWrapper` and rendered via `SortableBlock.module.css` `.emptyWrapper`.
- `sectionTitle` should use transparent wrapper styling only in **view mode** (not editor mode), via the same shared wrapper decision path.
- `sectionTitle` size is `config.canvasPx × config.subRowPx` (desktop: `875×90`, mobile: `540×120`) and occupies **half-row grid height** (`h = 0.5`) to avoid dead space below.

### Editor Preview Modes (`app/editor/page.tsx` + `components/layout/PageLayout/`)

- Screen buckets are defined as: desktop `>=1360`, tablet `960-1359`, mobile `<960`.
- Viewport logic should be centralized in `lib/editor-engine/data/viewport.ts` and hooks (`hooks/useViewportMode.ts`, `hooks/useEditorViewportPreview.ts`).
- The editor has a **desktop/mobile preview toggle** for visual editing without resizing the browser window, but only when screen width is `>=960`.
- `PageLayout` exposes `previewViewport` (`"desktop" | "mobile"`) and `framedMobilePreview` (boolean): editor passes `framedMobilePreview={true}` for the framed mobile preview, while view pages keep it `false` for clean public mobile layout.
- In mobile preview mode, only page content is previewed (`ProfileSidebar` + `BlockCanvas`); editor controls (`SaveButton`, `LogoutButton`, preview toggle, bottom toolbar) remain outside the preview frame.
- Mobile preview frame is capped to `540px` max width and intentionally styled (frame/background) to make preview boundaries explicit.
- Sticky sidebar styling is viewport-driven: sticky only when `data-preview="desktop"` and sidebar is not `center`.
- Tablet mode (`960-1359`) should force profile position to `center` in editor and hide the profile-position section from the toolbar palette.
- Mobile editor mode should also hide the profile-position section; profile positioning is a desktop-only editing feature.
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
  - `editor-store.ts` — dual block arrays (`desktopBlocks`, `mobileBlocks`), `activeViewportMode`, and viewport-scoped actions. Exports `selectActiveViewportBlocks` selector.
  - `auth-store.ts` — auth/user state.
- Store files should be thin — just `create<StoreType>()(...)` with the type imported from `types/`.
- Derived/computed values can use Zustand selectors in components.
- **EditorContext** provides `onUpdateBlock` and `onRemoveBlock` to block components so they don't import the store directly.
- **View pages (`/[username]`) must not use any Zustand store.** The server component fetches all blocks using `ServerPageService` (`lib/services/page.server.ts`), splits by `viewport_mode`, normalizes, and passes `blocksByViewport` as props. The client `PageView` component selects visible blocks from props based on `useViewportMode()` — no store hydration needed.

---

## 8. File & Image Uploads

- All image processing flows through `lib/uploads/`:
  - `imageProcessing.ts` — low-level WebP conversion using `browser-image-compression`
  - `imageWebp.ts` — high-level helpers (`toWebpFile`, `fileToWebpDataUrl`, `dataUrlToWebpFile`)
  - `pageImageStorage.ts` — Supabase Storage upload/delete with `.webp` paths
- The shared `WebpOptions` type lives in `types/uploads.ts`.
- Always convert to WebP before uploading. Use `.webp` file extensions in storage paths.

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

Blocks are stored and rendered per viewport mode (`"desktop"` | `"mobile"`).

### Database

- The `blocks` table has a `viewport_mode` column (`text NOT NULL DEFAULT 'desktop'`, constrained to `'desktop'` or `'mobile'`).
- Each block row belongs to exactly one viewport.

### Editor Flow

- Editor loads all blocks in a single query, splits by `viewport_mode` in-memory, and hydrates `editor-store` via `setAllBlocks({ desktop, mobile })`.
- `activeViewportMode` in the store is synced to the editor's preview toggle.
- All block mutations (`addBlock`, `updateBlock`, `removeBlock`, `reorderBlocks`) accept an optional `mode` parameter; when omitted, they default to `activeViewportMode`.
- Save (`lib/editor/saveEditorPage.ts`) upserts all block rows with explicit `viewport_mode`, then deletes stale rows per viewport.

### View Page Flow

- `app/[username]/page.tsx` (server component) fetches all blocks in one query, filters into `desktop` / `mobile` arrays, normalizes both, and passes `blocksByViewport` to `PageView`.
- `PageView` (client component) uses `useViewportMode()` to pick `visibleBlocks` and `renderMode` from props — **no store, no hydration**.
- `PageView` passes `previewViewport={renderMode}` into `PageLayout`, and leaves `framedMobilePreview` as default `false` so public mobile pages keep clean layout styling.
- `BlockCanvas` receives `renderMode` and delegates to the correct canvas without re-detecting viewport.

### Key Type: `BlocksByViewport`

```ts
type BlocksByViewport = { desktop: Block[]; mobile: Block[] };
```

Used in: `EditorState.setAllBlocks`, `saveEditorPage`, server component → `PageView` props.

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
