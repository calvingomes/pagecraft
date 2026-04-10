# New Block Checklist

## 1. `types/editor.ts`
- Add the block interface
- Add the type string to `BlockType`
- Add the interface to the `Block` union

## 2. `components/blocks/YourBlock/YourBlock.tsx` + `YourBlock.module.css`
- `"use client"` at top
- Read `useEditorContext()` — `null` means read-only (view page), non-null means editor
- No direct store imports — mutations go through `editor?.onUpdateBlock` / `editor?.onRemoveBlock`
- Use `--block-bg-color` / `--block-text-color` CSS variables for theme awareness

## 3. `components/builder/BlockRegistry/blockRegistry.tsx`
- Add the type to `BlockRendererMap`
- Add the renderer to `blockRegistry`

## 4. `components/builder/Toolbars/WidgetMenu.tsx`
- Add an entry to the `WIDGETS` array with an icon, title, and description
- If creation needs a URL/input before the block is made (like LinkBlock), add a special case in `handleWidgetClick` — otherwise the default `onAddBlock?.(widgetId)` path handles it

## 5. Block creation handler — wherever `onAddBlock` resolves to a new block object
- Add a `case` for your new type
- Set the default `styles: { widthPreset: "..." }` here — pick the closest fit from the existing presets below

| preset | desktop cols × rows |
|---|---|
| `small` | 1 × 1 |
| `wide` | 2 × 1 |
| `large` | 2 × 2 |
| `tall` | 1 × 2 |
| `skinnyWide` | 2 × 0.5 |
| `max` / `full` | 4 × 1 |

If none fit, add a new `case` to `spansForPreset` in `lib/editor-engine/grid/grid-math.ts` and add the preset string to `BlockWidthPreset` in `types/editor.ts`.

## 6. `lib/editor-engine/data/normalization.ts` → `normalizeStoredBlocks`
- Only needed if the block requires post-load fixups (e.g. enforcing a default `widthPreset`, or packing/unpacking nested data from the styles JSONB)
- Mandatory if `widthPreset` must always be `"full"` (like `sectionTitle`)

## 7. `components/builder/SortableBlock/SortableBlock.tsx`
Check these three spots and add your type only if the behaviour applies:
- **No hover toolbar** — `showHoverToolbar` currently excludes `sectionTitle`
- **Transparent wrapper** — only `sectionTitle` in view mode; add yours if it has no visible background
- **Focused border** — the inline style checks for `text` / `sectionTitle`; add yours if it should show the focus border

## 8. Saving — `lib/editor/saveEditorPage.ts`

For most blocks **nothing to do** — the save function upserts all blocks generically into the `blocks` table using JSONB columns (`content`, `styles`).

Only touch this file if your block involves **file uploads**:
- Detect a data URL or new file in the block's content
- Call `uploadPageImage` from `lib/uploads/pageImageStorage.ts` (add a new `scope.kind` for your block type if needed)
- Swap the resolved URL back into the block before upsert
- Update `storage_bytes_used` on the profile row

## 10. Write a test — `components/blocks/YourBlock/__tests__/YourBlock.test.tsx`
Use the standard pattern:
```tsx
const mockUseEditorContext = vi.fn(() => null as any);
vi.mock("@/contexts/EditorContext", () => ({
  useEditorContext: () => mockUseEditorContext(),
}));

const { YourBlock } = await import("../YourBlock");
```
Cover at minimum: returns null when empty in read-only, renders content when data is present.

## 11. Run `bun run test`
All tests must pass before committing.
