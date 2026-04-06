"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Block, EditorState } from "@/types/editor";

export const selectActiveViewportBlocks = (state: EditorState) => state.blocks;

export const useEditorStore = create<EditorState>()(
  devtools((set) => ({
    blocks: [],
    activeViewportMode: "desktop",
    selectedBlockId: null,
    focusedBlockId: null,
    isActualMobile: false,

    setAllBlocks: (blocks) => set({ blocks }),

    setActiveViewportMode: (mode) => set({ activeViewportMode: mode }),

    addBlock: (block) =>
      set((state) => ({
        blocks: [...state.blocks, block],
      })),

    updateBlock: (id, updates) =>
      set((state) => ({
        blocks: state.blocks.map((block) =>
          block.id === id ? ({ ...block, ...updates } as Block) : block,
        ),
      })),

    removeBlock: (id) =>
      set((state) => ({
        blocks: state.blocks.filter((block) => block.id !== id),
      })),

    selectBlock: (id) => set({ selectedBlockId: id, focusedBlockId: null }),

    focusBlock: (id) => set({ focusedBlockId: id }),

    setIsActualMobile: (val) => set({ isActualMobile: val }),
  })),
);
