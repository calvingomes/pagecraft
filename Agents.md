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
- **One file per domain** in `types/`. 
  - `types/editor.ts`: Core block and engine types.
  - `types/builder.ts`: Editor UI, Toolbar, and Renderer types.
  - `types/blocks.ts`: Component-level block interfaces.
- **No inline types** in components/hooks unless truly private.
- **Zustand**: Keep stores thin. Use `EditorContext` to pass actions to blocks; avoid direct store imports in leaf components.

### Modular Block Architecture
- **Block Registry**: All blocks must be registered in `components/builder/BlockRegistry/blockRegistry.tsx`.
- **Action Registry**: Block-specific toolbar tools belong in `components/builder/HoverToolbar/BlockActions/ActionRegistry.tsx`. Do NOT bloat `BlockHoverToolbar.tsx` with block-specific conditionals.
- **Component Isolation**: Block components should be "dumb" and receive interaction-locking state (`isMapUnlocked`, etc.) via props from the `BlockRenderer`.

### Performance Patterns
- **Render-pass State Synchronization**: Avoid `useEffect` for syncing props into local state. Use the "State sync during render" pattern:
  ```tsx
  const [prevVal, setPrevVal] = useState(propVal);
  if (propVal !== prevVal) {
    setPrevVal(propVal);
    setInternalState(propVal);
  }
  ```
- **Heavy Dependencies**: Load libraries (e.g., Mapbox, Tiptap) via `next/dynamic` with `{ ssr: false }`.

### CSS Modules
- **Modular Styles**: One `.module.css` per component. No hardcoded colors/breakpoints—use `styles/colors.css` and `styles/media.css`.
- **Dynamic Theming**: Use `deriveTextColor(bgColor)` for contrast. Child components must use `--block-bg-color` and `--block-text-color`.
- **Breakpoints**: Mobile `< 960px` | Tablet `960px - 1359px` | Desktop `≥ 1360px`.

### UI (Radix UI)
- Use Radix primitives for Dialogs, Popovers, and Toolbars.
- **Portals**: Always use `Popover.Portal` / `Dialog.Portal` for layered UI to avoid z-index conflicts.

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

Refer to [NEW_BLOCK.md](NEW_BLOCK.md) for the full 8-step integration guide.
1. Add types (`types/editor.ts`, `types/blocks.ts`).
2. Create component + modular CSS.
3. Register in `blockRegistry`.
4. Add to `WidgetMenu`.
5. Define spans in `grid-math.ts`.
6. Handle normalization.
7. Integrate custom tools in `ActionRegistry`.
8. Verify via Unit & E2E tests.
