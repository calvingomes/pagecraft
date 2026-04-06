"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { EditorContextValue } from "@/types/editor";

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({
  username,
  selectedBlockId,
  focusedBlockId,
  onUpdateBlock,
  onRemoveBlock,
  onSelectBlock,
  onFocusBlock,
  isActualMobile,
  children,
}: EditorContextValue & { children: ReactNode }) {
  return (
    <EditorContext.Provider
      value={{
        username,
        selectedBlockId,
        focusedBlockId,
        onUpdateBlock,
        onRemoveBlock,
        onSelectBlock,
        onFocusBlock,
        isActualMobile,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  return useContext(EditorContext);
}
