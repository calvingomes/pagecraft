"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Block } from "@/types/editor";

type EditorContextValue = {
  username: string | null;
  onUpdateBlock: (id: string, updates: Partial<Block>) => Promise<void>;
  onRemoveBlock: (id: string) => Promise<void>;
};

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({
  username,
  onUpdateBlock,
  onRemoveBlock,
  children,
}: EditorContextValue & { children: ReactNode }) {
  return (
    <EditorContext.Provider value={{ username, onUpdateBlock, onRemoveBlock }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  return useContext(EditorContext);
}
