"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { EditorContextValue } from "@/types/editor";

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
