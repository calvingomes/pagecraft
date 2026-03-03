"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Block } from "@/types/editor";
import type { EditorState } from "@/types/editor";

export const useEditorStore = create<EditorState>()(
  devtools((set, get) => ({
    blocks: [],
    selectedBlockId: null,

    setBlocks: (blocks) => set({ blocks }),

    addBlock: (block) =>
      set((state) => ({
        blocks: [...state.blocks, block],
      })),

    updateBlock: (id, updates) =>
      set((state) => ({
        blocks: state.blocks.map((b) =>
          b.id === id ? ({ ...b, ...updates } as Block) : b,
        ),
      })),

    removeBlock: (id) =>
      set((state) => ({
        blocks: state.blocks.filter((b) => b.id !== id),
      })),

    reorderBlocks: (activeId, overId) => {
      const { blocks } = get();
      const oldIndex = blocks.findIndex((b) => b.id === activeId);
      const newIndex = blocks.findIndex((b) => b.id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const updated = [...blocks];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);

      set({
        blocks: updated.map((b, index) => ({
          ...b,
          order: index,
        })),
      });
    },

    selectBlock: (id) => set({ selectedBlockId: id }),
  })),
);
