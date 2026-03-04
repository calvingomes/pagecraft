# PageCraft — Coding Instructions

These guidelines define how code should be written and organized in this project.
Follow them when adding features, fixing bugs, or refactoring.

---

## 1. Project Structure

```
types/          — All shared TypeScript types (no runtime code)
lib/            — Pure logic, utilities, and external service wrappers
helper/         — Small pure-function helpers (no side-effects, no imports from lib/)
stores/         — Zustand stores (thin — types live in types/)
contexts/       — React contexts (thin — types live in types/)
hooks/          — Shared React hooks (not tied to a single component)
components/
  blocks/       — Visual block components (TextBlock, LinkBlock, ImageBlock, SectionTitleBlock)
  builder/      — Editor infrastructure (canvas, toolbars, dnd, registry)
  layout/       — Page-level layout shells (Header, Navbar, PageLayout, ProfileSidebar)
  ui/           — Generic reusable UI primitives (WordCount, etc.)
  views/        — Full-page view compositions (AuthView, HomeLanding, PageView)
app/            — Next.js App Router pages and API routes
styles/         — Global CSS custom properties and media queries
```

---

## 2. Type Definitions

- **All shared types live in `types/`.**  
  Do not define types inline in stores, contexts, hooks, or lib files unless they are truly private to that file's implementation (e.g., a local helper type used nowhere else).

- **One file per domain:**
  - `types/editor.ts` — Block types (`TextBlock`, `LinkBlock`, `ImageBlock`, `SectionTitleBlock`), `EditorState`, `EditorContextValue`, `LinkMetadataResponse`
  - `types/grid.ts` — Grid geometry (`GridLayout`, `GridRect`, `PlacedRect`, `LayoutById`, `CompactResult`)
  - `types/page.ts` — Page-level enums (`PageBackgroundId`, `SidebarPosition`, `AvatarShape`)
  - `types/builder.ts` — Builder/component props (`BlockCanvasProps`, `SortableBlockProps`, DnD snapshot types)
  - `types/auth.ts` — Auth store shape (`AuthStore`)
  - `types/uploads.ts` — Upload/image processing options (`WebpOptions`)

- **Component-specific prop types** can live in a co-located `*.types.ts` file (e.g., `ProfileSidebar.types.ts`, `BlockHoverToolbar.types.ts`, `Toolbar.types.ts`).

- **Re-export** when a type was previously exported from a non-type file and external consumers depend on it:
  ```ts
  export type { LayoutById } from "@/types/grid";
  ```

---

## 3. CSS Modules

- **Every component gets its own `*.module.css`** — no global utility classes.
- **ProseMirror overrides** go in a co-located `*.prosemirror.css` file imported from the module CSS.
- Use CSS custom properties from `styles/colors.css` and `styles/media.css` — never hardcode colors or breakpoints that are already defined as variables.
- **Delete dead CSS immediately.** If a class is no longer referenced in the component, remove it. Do not leave commented-out rules.
- **No duplicate selectors** across files. If two components need the same style, extract it to a shared module or use CSS custom properties.
- Use `@import "@styles/media.css"` at the top of any module that needs responsive breakpoints.

### Breakpoint Ranges

- Desktop view: `1360px` and above
- Tablet view: `960px` to `1359px`
- Mobile view: below `960px`

---

## 4. Grid System Constants

All grid constants are centralized in `lib/blockGrid.ts`:

| Constant          | Value | Purpose                                    |
| ----------------- | ----- | ------------------------------------------ |
| `GRID_COLS`       | 4     | Number of columns                          |
| `GRID_CELL_PX`    | 200   | Base cell size in pixels                   |
| `GRID_GAP_PX`     | 20    | Gap between cells                          |
| `GRID_CANVAS_PX`  | 875   | Total canvas width                         |
| `GRID_ROW_SCALE`  | 2     | Vertical sub-row precision (0.5 row units) |
| `GRID_ROW_PX`     | 90    | Sub-row content height                     |
| `GRID_ROW_GAP_PX` | 20    | Sub-row vertical gap                       |

**Never hardcode these values** elsewhere. Import from `@/lib/blockGrid`.

### BlockWidthPreset Reference

- `small` → `200x200`
- `wide` → `420x200`
- `skinnyWide` → `420x90` (half-row height preset)
- `max` → `875x200`
- `tall` → `200x420`
- `large` → `420x420`
- `full` → `875x100`

Current product behavior:

- `skinnyWide` is supported in grid/layout logic, but the resize toolbar should show it only for `text` and `link` blocks.
- `max` is supported in grid/layout logic, but the resize toolbar should show it only for `text` blocks.

- `spansForPreset(preset)` → `{ w, h }` column/row spans for a `BlockWidthPreset`
- `spansForBlock(block, overridePreset?)` → block-aware spans
- `sizePxForPreset(preset)` → `{ widthPx, heightPx }` derived pixel sizes
- `sizePxForBlock(block)` → block-aware pixel dimensions
- `rectForBlock(block, layout?)` → full `PlacedRect` geometry
- `canPlaceBlockAt`, `findFirstFreeSpot`, `resolveCollisions` — placement/collision logic

Do not duplicate these functions. If you need grid math, it belongs in `blockGrid.ts`.

**Do / Don't**

- **Do:** Keep block components focused on UI + editor events; call shared layout helpers from `lib/`.
- **Do:** Reuse `sizePxForBlock`, and `spansForBlock`.
- **Do:** Keep visual block height based on normalized content height; use quantized height for occupancy/reflow decisions.
- **Don't:** Add per-block collision or compaction loops directly inside component files.
- **Don't:** Hardcode row math (`0.5`, `200`, `20`) outside `lib/blockGrid.ts`.

---

## 5. Components

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

### Builder Components (`components/builder/`)

- `BlockRegistry/blockRegistry.tsx` is the single map from `BlockType → ReactNode`. When adding a new block type, add it here and in `types/editor.ts` — the `BlockRenderer` will pick it up automatically.
- `BlockCanvas` handles desktop/mobile switching and droppable grid cells.
- `SortableBlock` wraps each block with drag handles, resize toolbar, and hover detection.
- Hover toolbar background toggle: only `text` and `link` blocks should show the `BG` toggle control.
- Wrapper background state is persisted in `block.styles.transparentWrapper` and rendered via `SortableBlock.module.css` `.emptyWrapper`.
- `sectionTitle` should use transparent wrapper styling only in **view mode** (not editor mode), via the same shared wrapper decision path.
- `sectionTitle` size is fixed to `875x90` at render level and should occupy **half-row grid height** (`h = 0.5`) to avoid dead space below.

---

## 6. State Management

- **Zustand stores** hold transient editor and auth state.
- Store files should be thin — just `create<StoreType>()(...)` with the type imported from `types/`.
- Derived/computed values can use Zustand selectors in components.
- **EditorContext** provides `onUpdateBlock` and `onRemoveBlock` to block components so they don't import the store directly.

---

## 7. File & Image Uploads

- All image processing flows through `lib/uploads/`:
  - `imageProcessing.ts` — low-level WebP conversion using `browser-image-compression`
  - `imageWebp.ts` — high-level helpers (`toWebpFile`, `fileToWebpDataUrl`, `dataUrlToWebpFile`)
  - `pageImageStorage.ts` — Supabase Storage upload/delete with `.webp` paths
- The shared `WebpOptions` type lives in `types/uploads.ts`.
- Always convert to WebP before uploading. Use `.webp` file extensions in storage paths.

---

## 8. Code Style

- **No duplicate logic.** If a function exists in `lib/`, use it. Check before writing new utilities.
- **Imports**: use `@/` path aliases. Group: external → `@/types` → `@/lib` → `@/stores` → `@/contexts` → `@/components` → relative.
- **No barrel files** (`index.ts` re-exports). Import directly from the source file.
- Prefer `const` arrow functions for components: `export const MyComponent = (props: Props) => { ... }`.
- Use `type` imports (`import type { ... }`) for types that don't need runtime presence.
- Keep files focused: one primary export per file. If a file grows beyond ~200 lines, consider splitting.

---

## 9. Naming Conventions

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

## 10. Adding a New Block Type

1. Add the interface to `types/editor.ts` and include it in the `Block` union.
2. Add the `type` string to `BlockType`.
3. Create `components/blocks/YourBlock/YourBlock.tsx` + `YourBlock.module.css`.
4. Register it in `components/builder/BlockRegistry/blockRegistry.tsx`.
5. Add span defaults in `lib/blockGrid.ts` → `spansForPreset` (if it uses a new preset).

6. Handle creation in `app/editor/page.tsx` toolbar action.
7. Handle normalization in `lib/normalizeBlocks.ts` → `normalizeStoredBlocks`.
