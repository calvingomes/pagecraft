# Adding a New Block — Step-by-Step

Follow these 8 steps to ensure a new block is modular, performant, and correctly typed.

## 1. Define Types (`types/editor.ts` & `types/blocks.ts`)
- **Core**: Add your type string to `BlockType` (e.g., `"map"`) and create your block interface (e.g., `MapBlock`) in `types/editor.ts`. Add it to the `Block` union.
- **Component**: Put any component-specific interfaces or API types in `types/blocks.ts`. **NO INLINE TYPES** in the component file.

## 2. Create Component (`components/blocks/`)
- Create `YourBlock/` directory with `YourBlock.tsx` and `YourBlock.module.css`.
- Use CSS variables for theming: `--block-bg-color` and `--block-text-color`.
- Split heavy logic or external libraries into sub-components loaded via `next/dynamic` (ssr: false).

## 3. Register Block (`components/builder/BlockRegistry/blockRegistry.tsx`)
- Add your component to the `blockRegistry` map. This allows the `BlockRenderer` to dynamically load and display your block.

## 4. Add to Widget Menu (`components/builder/Toolbars/WidgetMenu.tsx`)
- Add your block's icon, title, and description to the `WIDGETS` array. This makes it available for users to add to their page.

## 5. Set Sizes & Presets (`lib/editor-engine/grid/grid-math.ts`)
- If your block requires a custom default size or fixed aspect ratio, update `spansForPreset` or `spansForBlock`.

## 6. Handle Normalization (`lib/editor-engine/data/normalization.ts`)
- Update `normalizeStoredBlocks` ONLY if your block requires specialized defaults (e.g., specific content fields that must exist).

## 7. Modular Toolbar Actions (`components/builder/HoverToolbar/BlockActions/`)
- **Plugin Pattern**: Create a specialized `YourActions.tsx` (e.g., `MapActions.tsx`) for your block's specific tools.
- **Register**: Add your action component to the `ActionRegistry` mapping in `ActionRegistry.tsx`.
- **Hiding Defaults**: If your block should NOT use the default background color picker, simply don't register it in your custom action component.

## 8. Performance: State Sync
- If your block is interactive (e.g., panning a map, adjusting an editor), avoid using `useEffect` to sync props back into state. 
- Use the **Render-pass State Synchronization** pattern documented in [Agents.md](Agents.md) to avoid cascading renders.

---

## Testing & Validation Checklist
- [ ] **Unit Test**: co-locate `__tests__/YourBlock.test.tsx`.
- [ ] **Lint**: Run `bun run lint` to verify zero inline types and unused variables.
- [ ] **E2E**: Verify block creation, "Move" mode interactivity, and persistence across page refreshes.
