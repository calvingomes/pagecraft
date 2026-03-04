"use client";

import {
  selectActiveViewportBlocks,
  useEditorStore,
} from "@/stores/editor-store";
import type { Block } from "@/types/editor";
import type { BlockCanvasProps, BlockCanvasRenderMode } from "@/types/builder";
import { MobileBlockCanvas } from "./mobile/MobileBlockCanvas";
import { DesktopBlockCanvas } from "./desktop/DesktopBlockCanvas";

const EditableBlockCanvas = () => {
  const activeBlocks = useEditorStore(selectActiveViewportBlocks);
  const activeEditorViewportMode = useEditorStore((s) => s.activeViewportMode);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const reorderBlocks = useEditorStore((s) => s.reorderBlocks);
  const renderViewportMode = activeEditorViewportMode;
  const blocks = activeBlocks;

  if (renderViewportMode === "mobile") {
    return (
      <MobileBlockCanvas
        editable
        blocks={blocks}
        onUpdateBlock={(id: string, updates: Partial<Block>) =>
          updateBlock(id, updates, "mobile")
        }
      />
    );
  }

  return (
    <DesktopBlockCanvas
      editable
      blocks={blocks}
      onUpdateBlock={(id: string, updates: Partial<Block>) =>
        updateBlock(id, updates, "desktop")
      }
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
