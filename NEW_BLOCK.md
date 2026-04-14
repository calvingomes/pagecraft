# Adding a New Block — Step-by-Step

Follow these 7 steps to ensure a block is fully integrated into types, logic, and the editor UI.

## 1. Define Types (`types/editor.ts`)
- Add your type string to `BlockType` (e.g., `"map"`).
- Create the interface (e.g., `export interface MapBlock extends BaseBlock { type: "map"; content: { ... } }`).
- Add it to the `Block` union.

## 2. Create Component (`components/blocks/`)
Create `YourBlock/YourBlock.tsx` and `YourBlock.module.css`.
- Use `"use client"` and `useEditorContext()`.
- Use `--block-bg-color` and `--block-text-color` for theming.
- Split heavy editors into `*Editor.tsx` using `next/dynamic` (ssr: false) if they use Tiptap.

## 3. Register Block (`components/builder/BlockRegistry/blockRegistry.tsx`)
- Import your types and component.
- Add your block to the `blockRegistry` map so the `BlockRenderer` knows how to draw it.

## 4. Add to Widget Menu (`components/builder/Toolbars/WidgetMenu.tsx`)
- Add an entry to the `WIDGETS` array (Icon, Title, Description).
- New blocks are created via the `onAddBlock` handler. Ensure your type is uniquely identifiable.

## 5. Set Sizes & Presets (`lib/editor-engine/grid/grid-math.ts`)
- If your block uses standard presets (`small`, `wide`, `large`), it works automatically. 
- Only update `spansForPreset` if you need a unique custom size.

## 6. Handle Normalization (`lib/editor-engine/data/normalization.ts`)
- Update `normalizeStoredBlocks` ONLY if your block requires a specialized default (e.g., Sections must always be `widthPreset: "full"`).

## 7. Refine Editor UI
- **Toolbar Customization**: If your block (like Map) shouldn't have a background color picker, update `BlockHoverToolbar.tsx` to hide it.
- **Wrapper Logic**: Check `lib/blockWrapper.ts` to determine if your block should use the transparent wrapper logic.
- **Sortable Shell**: check `SortableBlock.tsx` if you need custom cursor or interaction behavior.

---

## 8. Testing & Validation
- **Unit Test**: Create `__tests__/YourBlock.test.tsx` using the standard pattern (mock `EditorContext`).
- **Sanity Check**: Run `bun run test` to ensure grid logic and normalization are still passing.
- **E2E**: Verify block creation, persistence after save, and cross-viewport visibility in the browser.
