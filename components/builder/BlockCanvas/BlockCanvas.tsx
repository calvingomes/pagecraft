"use client";

import {
  useEditorStore,
} from "@/stores/editor-store";
import type { Block } from "@/types/editor";
import type { BlockCanvasProps, BlockCanvasRenderMode } from "@/types/builder";
import { MobileBlockCanvas } from "./mobile/MobileBlockCanvas";
import { DesktopBlockCanvas } from "./desktop/DesktopBlockCanvas";

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

const ReadonlyBlockCanvas = ({
  blocks,
  renderMode,
}: {
  blocks: Block[];
  renderMode: BlockCanvasRenderMode;
}) => {
  if (renderMode === "mobile") {
    return <MobileBlockCanvas editable={false} blocks={blocks} />;
  }

  return <DesktopBlockCanvas editable={false} blocks={blocks} />;
};

export const BlockCanvas = (props: BlockCanvasProps) => {
  if (props.editable) {
    return <EditableBlockCanvas />;
  }

  return (
    <ReadonlyBlockCanvas blocks={props.blocks} renderMode={props.renderMode} />
  );
};
