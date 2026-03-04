"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Block, BlockViewportMode, EditorState } from "@/types/editor";

const resolveMode = (
  explicitMode: BlockViewportMode | undefined,
  activeMode: BlockViewportMode,
) => explicitMode ?? activeMode;

const blocksForMode = (state: EditorState, mode: BlockViewportMode) =>
  mode === "mobile" ? state.mobileBlocks : state.desktopBlocks;

const withBlocksForMode = (
  state: EditorState,
  mode: BlockViewportMode,
  nextBlocks: Block[],
): Partial<EditorState> =>
  mode === "mobile"
    ? { mobileBlocks: nextBlocks }
    : { desktopBlocks: nextBlocks };

export const selectActiveViewportBlocks = (state: EditorState) =>
  state.activeViewportMode === "mobile"
    ? state.mobileBlocks
    : state.desktopBlocks;

export const useEditorStore = create<EditorState>()(
  devtools((set, get) => ({
    desktopBlocks: [],
    mobileBlocks: [],
    activeViewportMode: "desktop",
    selectedBlockId: null,

    setBlocksForViewport: (mode, blocks) =>
      set((state) => withBlocksForMode(state, mode, blocks)),

    setAllBlocks: (blocks) =>
      set({
        desktopBlocks: blocks.desktop,
        mobileBlocks: blocks.mobile,
      }),

    setActiveViewportMode: (mode) => set({ activeViewportMode: mode }),

    addBlock: (block, mode) =>
      set((state) => {
        const resolvedMode = resolveMode(mode, state.activeViewportMode);
        const nextBlocks = [...blocksForMode(state, resolvedMode), block];
        return withBlocksForMode(state, resolvedMode, nextBlocks);
      }),

    updateBlock: (id, updates, mode) =>
      set((state) => {
        const resolvedMode = resolveMode(mode, state.activeViewportMode);
        const nextBlocks = blocksForMode(state, resolvedMode).map((block) =>
          block.id === id ? ({ ...block, ...updates } as Block) : block,
        );
        return withBlocksForMode(state, resolvedMode, nextBlocks);
      }),

    removeBlock: (id, mode) =>
      set((state) => {
        const resolvedMode = resolveMode(mode, state.activeViewportMode);
        const nextBlocks = blocksForMode(state, resolvedMode).filter(
          (block) => block.id !== id,
        );
        return withBlocksForMode(state, resolvedMode, nextBlocks);
      }),

    reorderBlocks: (activeId, overId, mode) => {
      const state = get();
      const resolvedMode = resolveMode(mode, state.activeViewportMode);
      const blocks = blocksForMode(state, resolvedMode);
      const oldIndex = blocks.findIndex((b) => b.id === activeId);
      const newIndex = blocks.findIndex((b) => b.id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const updated = [...blocks];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);

      const reordered = updated.map((b, index) => ({
        ...b,
        order: index,
      }));

      set((currentState) =>
        withBlocksForMode(currentState, resolvedMode, reordered),
      );
    },

    selectBlock: (id) => set({ selectedBlockId: id }),
  })),
);
