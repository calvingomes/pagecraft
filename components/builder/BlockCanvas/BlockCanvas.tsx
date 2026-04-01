"use client";

import dynamic from "next/dynamic";
import { useEditorStore } from "@/stores/editor-store";
import type { BlockCanvasProps } from "@/types/builder";
import { ReadOnlyGrid } from "./ReadOnlyGrid";

// Dynamically import the heavy RGL-based editor canvases
const DesktopBlockCanvas = dynamic(
  () => import("./desktop/DesktopBlockCanvas").then((mod) => mod.DesktopBlockCanvas),
  { ssr: false }
);

const MobileBlockCanvas = dynamic(
  () => import("./mobile/MobileBlockCanvas").then((mod) => mod.MobileBlockCanvas),
  { ssr: false }
);

const EditableBlockCanvas = () => {
  const blocks = useEditorStore((s) => s.blocks);
  const activeEditorViewportMode = useEditorStore((s) => s.activeViewportMode);
  const updateBlock = useEditorStore((s) => s.updateBlock);

  if (activeEditorViewportMode === "mobile") {
    return (
      <MobileBlockCanvas
        editable
        blocks={blocks}
        onUpdateBlock={updateBlock}
      />
    );
  }

  return (
    <DesktopBlockCanvas
      editable
      blocks={blocks}
      onUpdateBlock={updateBlock}
    />
  );
};

export const BlockCanvas = (props: BlockCanvasProps) => {
  if (props.editable) {
    return <EditableBlockCanvas />;
  }

  return (
    <ReadOnlyGrid blocks={props.blocks} renderMode={props.renderMode} />
  );
};
