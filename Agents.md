# PageCraft — Coding Rules & Constants

Follow these instructions strictly when adding features, fixing bugs, or refactoring.

---

## 1. Grid System Constants

Grid logic is centralized in `lib/editor-engine/`. Access values via `DESKTOP_GRID.*` or `MOBILE_GRID.*`.

### Grid Config Values

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

### Block Width Presets

- **Small**: `200×200` | **Wide**: `425×200` | **Max**: `875×200` (Desktop Text only)
- **Tall**: `200×425` | **Large**: `425×425` | **Full**: `875×100` (`h = 0.5`)
- **SkinnyWide**: `425×90` (Half-row height; `text` and `link` blocks only)

---

## 2. Coding Rules & Principles

### Types & State
- **One file per domain** in `types/` (e.g., `types/editor.ts`, `types/grid.ts`).
- **No inline types** in components/hooks unless truly private.
- **Zustand**: Keep stores thin. Use `EditorContext` to pass actions to blocks; avoid direct store imports in leaf components.

### CSS Modules
- **Modular Styles**: One `.module.css` per component. No hardcoded colors/breakpoints—use `styles/colors.css` and `styles/media.css`.
- **Dynamic Theming**: Use `deriveTextColor(bgColor)` for contrast. Child components must use `--block-bg-color` and `--block-text-color`.
- **Breakpoints**: Mobile `< 960px` | Tablet `960px - 1359px` | Desktop `≥ 1360px`.

### Component Architecture
- **View/Editor Split**: Heavy dependencies (Tiptap, RGL) belong in `*Editor.tsx`. Load these via `next/dynamic` with `{ ssr: false }`.
- **ReadOnly Mode**: Public view pages must use `ReadOnlyGrid` and zero-dependency block versions. No RGL or stores on the visitor path.
- **RGL Usage**: `isResizable={false}`, `compactType="vertical"`, `draggableHandle=".drag-handle"`.

### UI (Radix UI)
- Use Radix primitives for Dialogs, Popovers, and Toolbars.
- **Portals**: Always use `Popover.Portal` / `Dialog.Portal` for layered UI to avoid z-index conflicts.

### File Uploads
- **WebP focus**: Always convert images to WebP via `lib/uploads/` before uploading. Use `.webp` extensions in storage.
- **SEO**: Use Next.js `Image` for internal assets; `<img>` for external links (add `// eslint-disable-next-line @next/next/no-img-element`).

---

## 3. Naming Conventions

| Item             | Convention            | Example                         |
| ---------------- | --------------------- | ------------------------------- |
| Components/Files | PascalCase            | `TextBlock.tsx`                 |
| CSS Modules      | PascalCase.module.css | `TextBlock.module.css`          |
| CSS Classes      | camelCase             | `.blockContent`                 |
| Types            | PascalCase            | `BlockWidthPreset`              |
| Logic/Lib/Hooks  | camelCase             | `useAuthGuard.ts`, `gridMath.ts`|

---

## 4. Analytics Event Reference (PostHog)

**Strict Requirement**: Anonymous tracking only. Do **NOT** use `identify()` or `alias()`.

- `claim_cta_click`: Homepage hero claim button.
- `username_page_cta_click`: "Craft your page" CTA on profiles.
- `signup_google` / `signup_github`: Account setup completion.
- `editor_opened`: Tracks platform (mobile vs desktop).
- `viewport_preview_toggle`: Preview switching in editor.
- `first_save_complete`: The literal first successful save for a user.

---

## 5. Adding a New Block Type — Checklist

1.  Add interface to `types/editor.ts` (include in `Block` union and `BlockType`).
2.  Create `components/blocks/YourBlock/YourBlock.tsx` + `YourBlock.module.css`.
3.  Register in `components/builder/BlockRegistry/blockRegistry.tsx`.
4.  Add span defaults in `lib/editor-engine/grid/grid-math.ts` → `spansForPreset`.
5.  Handle creation in `app/editor/page.tsx` toolbar action.
6.  Handle normalization in `lib/editor-engine/data/normalization.ts`.
7.  Check viewport rendering in `DesktopBlockCanvas` and `MobileCanvasGrid`.
