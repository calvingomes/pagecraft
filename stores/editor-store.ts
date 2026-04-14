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
    isMapUnlocked: false,

    setAllBlocks: (blocks) => set({ blocks }),

    setActiveViewportMode: (mode) => set({ activeViewportMode: mode }),

    addBlock: (block) =>
      set((state) => ({
        blocks: [...state.blocks, block],
      })),

    updateBlock: (id, updates) =>
      set((state) => ({
        blocks: state.blocks.map((block) => {
          if (block.id !== id) return block;

          const newBlock = { ...block, ...updates };

          // Deep merge known nested style/state objects to prevent data loss
          if (updates.styles && block.styles) {
            newBlock.styles = { ...block.styles, ...updates.styles };
          }
          if (updates.mobileStyles && block.mobileStyles) {
            newBlock.mobileStyles = { ...block.mobileStyles, ...updates.mobileStyles };
          }
          if (updates.visibility && block.visibility) {
            newBlock.visibility = { ...block.visibility, ...updates.visibility };
          }

          return newBlock as Block;
        }),
      })),

    removeBlock: (id) =>
      set((state) => ({
        blocks: state.blocks.filter((block) => block.id !== id),
        selectedBlockId:
          state.selectedBlockId === id ? null : state.selectedBlockId,
        focusedBlockId: state.focusedBlockId === id ? null : state.focusedBlockId,
        // Reset unlock state if the removed block was the selected one
        isMapUnlocked: state.selectedBlockId === id ? false : state.isMapUnlocked,
      })),

    selectBlock: (id) => set({ selectedBlockId: id, focusedBlockId: null, isMapUnlocked: false }),

    focusBlock: (id) => set({ focusedBlockId: id }),

    setIsActualMobile: (val) => set({ isActualMobile: val }),

    setIsMapUnlocked: (val) => set({ isMapUnlocked: val }),
  })),
);
