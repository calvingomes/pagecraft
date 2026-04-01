"use client";

import { useMemo, useRef } from "react";
import ReactGridLayout from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import type { Block } from "@/types/editor";
import { SortableBlock } from "@/components/builder/SortableBlock/SortableBlock";
import { useEditorContext } from "@/contexts/EditorContext";
import { MOBILE_GRID } from "@/lib/editor-engine/grid/grid-config";
import { sizePxForBlock } from "@/lib/editor-engine/grid/grid-math";
import { blockToRglItem } from "@/lib/editor-engine/rgl/blockToRglItem";
import { rglLayoutToBlockUpdates } from "@/lib/editor-engine/rgl/rglLayoutToBlockUpdates";
import { useResponsiveZoom } from "@/hooks/useResponsiveZoom";
import "react-grid-layout/css/styles.css";
import styles from "../BlockCanvas.module.css";

type MobileCanvasGridProps =
  | {
      editable: true;
      blocks: Block[];
      onUpdateBlock: (id: string, updates: Partial<Block>) => void;
    }
  | {
      editable: false;
      blocks: Block[];
    };

export const MobileCanvasGrid = (props: MobileCanvasGridProps) => {
  const { editable, blocks } = props;
  const editor = useEditorContext();
  const snapshotRef = useRef<Record<string, { x: number; y: number }>>({});

  const { containerRef, zoom } = useResponsiveZoom(MOBILE_GRID.canvasPx);

  const projectedBlocks = useMemo(() => {
    return blocks.map((b) => ({
      ...b,
      layout: b.mobileLayout ?? b.layout,
      styles: { ...b.styles, ...b.mobileStyles },
    }) as Block);
  }, [blocks]);

  const visibleBlocks = useMemo(() => {
    return projectedBlocks.filter((b) => b.visibility?.mobile !== false);
  }, [projectedBlocks]);

  const layout = useMemo(() => {
    return visibleBlocks.map((block) => blockToRglItem(block, MOBILE_GRID));
  }, [visibleBlocks]);

  const handleDragStart = () => {
    snapshotRef.current = Object.fromEntries(
      visibleBlocks.map((block) => [
        block.id,
        {
          x: block.mobileLayout?.x ?? block.layout?.x ?? 0,
          y: block.mobileLayout?.y ?? block.layout?.y ?? 0,
        },
      ]),
    );
  };

  const handleLayoutChange = (newLayout: Layout[]) => {
    if (!editable || !props.onUpdateBlock) return;

    for (const item of newLayout) {
      props.onUpdateBlock(item.i, {
        mobileLayout: {
          x: item.x,
          y: item.y / MOBILE_GRID.rowScale,
        },
      });
    }
  };

  const handleDragStop = async (newLayout: Layout[]) => {
    if (!editable || !editor?.onUpdateBlock) return;

    const changed = rglLayoutToBlockUpdates(
      newLayout,
      snapshotRef.current,
      MOBILE_GRID,
    );

    await Promise.all(
      changed.map(({ id, x, y }) =>
        editor.onUpdateBlock(id, { mobileLayout: { x, y } }),
      ),
    );
  };

  return (
    <div ref={containerRef} className={styles.mobileCanvasWrapper}>
      <div
        className={styles.canvas}
        style={{
          width: `${MOBILE_GRID.canvasPx}px`,
          maxWidth: "none",
          zoom,
        }}
      >
        <ReactGridLayout
          layout={layout}
          cols={MOBILE_GRID.cols}
          width={MOBILE_GRID.canvasPx}
          rowHeight={MOBILE_GRID.subRowPx}
          margin={[MOBILE_GRID.gapXPx, MOBILE_GRID.subRowGapPx]}
          containerPadding={[0, 0]}
          compactType="vertical"
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
                dimensions={sizePxForBlock(block, MOBILE_GRID)}
                gridConfig={MOBILE_GRID}
              />
            </div>
          ))}
        </ReactGridLayout>
      </div>
    </div>
  );
};
