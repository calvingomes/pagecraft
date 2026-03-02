"use client";

import { useState } from "react";
import { ToolbarDefault } from "./ToolbarDefault";
import { ToolbarLink } from "./ToolbarLink";

import type { ToolbarDefaultProps, ToolbarMode } from "./Toolbar.types";

export const Toolbar = (props: ToolbarDefaultProps) => {
  const [mode, setMode] = useState<ToolbarMode>("default");
  const [linkUrl, setLinkUrl] = useState("");

  const handleCreateLink = async () => {
    const url = linkUrl.trim();
    if (!url || !props.onAddBlock) return;

    await props.onAddBlock("link", { url });
    setLinkUrl("");
    setMode("default");
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

  return <ToolbarDefault {...props} onOpenLink={() => setMode("link")} />;
};
