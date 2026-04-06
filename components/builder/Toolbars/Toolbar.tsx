"use client";

import { useState } from "react";
import { ToolbarDefault } from "./ToolbarDefault";
import { ToolbarLink } from "./ToolbarLink";
import type { ToolbarDefaultProps, ToolbarMode } from "./Toolbar.types";
import { useEditorContext } from "@/contexts/EditorContext";

export const Toolbar = (props: ToolbarDefaultProps) => {
  const [mode, setMode] = useState<ToolbarMode>("default");
  const [linkUrl, setLinkUrl] = useState("");
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const editor = useEditorContext();

  const isMobile = props.previewViewport === "mobile";
  const hasSelection = !!editor?.selectedBlockId;

  if (isMobile && hasSelection) {
    return null;
  }

  const handleCreateLink = async () => {
    if (isCreatingLink) return;

    const url = linkUrl.trim();
    if (!url || !props.onAddBlock) return;

    setIsCreatingLink(true);
    setLinkUrl("");
    setMode("default");

    try {
      await props.onAddBlock("link", { url });
    } finally {
      setIsCreatingLink(false);
    }
  };

  if (mode === "link") {
    return (
      <ToolbarLink
        linkUrl={linkUrl}
        onChangeLinkUrl={setLinkUrl}
        onBack={() => setMode("default")}
        onCreateLink={handleCreateLink}
      />
    );
  }

  return (
    <ToolbarDefault
      {...props}
      onOpenLink={() => setMode("link")}
      isSaving={props.isSaving}
      onLogout={props.onLogout}
    />
  );
};
