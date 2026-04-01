"use client";

import { useMemo, useRef } from "react";
import ReactGridLayout from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import type { Block } from "@/types/editor";
import { SortableBlock } from "@/components/builder/SortableBlock/SortableBlock";
import { useEditorContext } from "@/contexts/EditorContext";
import { DESKTOP_GRID } from "@/lib/editor-engine/grid/grid-config";
import { sizePxForBlock } from "@/lib/editor-engine/grid/grid-math";
import { blockToRglItem } from "@/lib/editor-engine/rgl/blockToRglItem";
import { rglLayoutToBlockUpdates } from "@/lib/editor-engine/rgl/rglLayoutToBlockUpdates";
import "react-grid-layout/css/styles.css";
import styles from "../BlockCanvas.module.css";

type DesktopBlockCanvasProps = {
  editable: boolean;
  blocks: Block[];
  onUpdateBlock?: (id: string, updates: Partial<Block>) => void;
};

export const DesktopBlockCanvas = ({
  editable,
  blocks,
  onUpdateBlock,
}: DesktopBlockCanvasProps) => {
  const editor = useEditorContext();
  const snapshotRef = useRef<Record<string, { x: number; y: number }>>({});

  const visibleBlocks = useMemo(() => {
    return blocks.filter((b) => b.visibility?.desktop !== false);
  }, [blocks]);

  const layout = useMemo(() => {
    return visibleBlocks.map((block) => blockToRglItem(block, DESKTOP_GRID));
  }, [visibleBlocks]);

  const handleDragStart = () => {
    snapshotRef.current = Object.fromEntries(
      visibleBlocks.map((block) => [
        block.id,
        { x: block.layout?.x ?? 0, y: block.layout?.y ?? 0 },
      ]),
    );
  };

  const handleLayoutChange = (newLayout: Layout[]) => {
    if (!editable || !onUpdateBlock) return;

    for (const item of newLayout) {
      onUpdateBlock(item.i, {
        layout: {
          x: item.x,
          y: item.y / DESKTOP_GRID.rowScale,
        },
      });
    }
  };

  const handleDragStop = async (newLayout: Layout[]) => {
    if (!editable || !editor?.onUpdateBlock) return;

    const changed = rglLayoutToBlockUpdates(
      newLayout,
      snapshotRef.current,
      DESKTOP_GRID,
    );

    await Promise.all(
      changed.map(({ id, x, y }) =>
        editor.onUpdateBlock(id, { layout: { x, y } }),
      ),
    );
  };

  return (
    <div
      className={styles.canvas}
      data-mobile-canvas-wrapper={styles.mobileCanvasWrapper}
    >
      <ReactGridLayout
        layout={layout}
        cols={DESKTOP_GRID.cols}
        width={DESKTOP_GRID.canvasPx}
        rowHeight={DESKTOP_GRID.subRowPx}
        margin={[DESKTOP_GRID.gapXPx, DESKTOP_GRID.subRowGapPx]}
        containerPadding={[0, 0]}
        compactType={null}
        isResizable={false}
        isDraggable={editable}
        draggableHandle=".drag-handle"
        onDragStart={handleDragStart}
        onLayoutChange={handleLayoutChange}
        onDragStop={handleDragStop}
      >
        {visibleBlocks.map((block) => (
          <div key={block.id}>
            <SortableBlock
              block={block}
              dimensions={sizePxForBlock(block, DESKTOP_GRID)}
              gridConfig={DESKTOP_GRID}
            />
          </div>
        ))}
      </ReactGridLayout>
    </div>
  );
};
