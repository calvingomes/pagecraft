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
  isMapUnlocked,
  setIsMapUnlocked,
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
        isMapUnlocked,
        setIsMapUnlocked,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  return useContext(EditorContext);
}
