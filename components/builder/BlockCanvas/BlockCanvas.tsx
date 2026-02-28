"use client";

import React from "react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { GridLayout } from "react-grid-layout";
// react-grid-layout has no shipped TypeScript definitions (we use a blanket
// module declaration in `types/react-grid-layout.d.ts`), but the component
// expects each layout entry to use the following property names. These are
// single letters because the library is ported from an earlier JS implementation
// and the names correspond to the underlying grid math. We document them here
// so future maintainers understand what they're for.
interface GridItem {
  /** unique block identifier (matches `block.id`) */
  i: string;
  /** horizontal grid position (column index, 0‑based) */
  x: number;
  /** vertical grid position (row index, 0‑based) */
  y: number;
  /** width in grid columns (span) */
  w: number;
  /** height in grid rows (span) */
  h: number;
  /** marks the item as immovable/resizable */
  static?: boolean;
}
import { useEditorStore } from "@/stores/editor-store";
import BlockRenderer from "@/components/builder/BlockRenderer/BlockRenderer";
import { SortableBlock } from "@/components/builder/SortableBlock/SortableBlock";
import type { Block, BlockWidthPreset } from "@/types/editor";

// We don't need responsive breakpoints for our fixed‑column editor,
// so use GridLayout (alias of ReactGridLayout) instead of the responsive
// component. This avoids requiring `cols` entries for md/sm/xs etc.

type BlockCanvasProps =
  | { editable: true }
  | { editable: false; blocks: Block[]; title?: string };

// width presets now map to grid column spans (see spanForPreset).
// pixel widths are no longer used here.

const spanForPreset = (preset: BlockWidthPreset): number => {
  switch (preset) {
    case "narrow":
      return 1;
    case "medium":
      return 2;
    case "wide":
      return 3;
    case "full":
    default:
      return 3;
  }
};

export const BlockCanvas = (props: BlockCanvasProps) => {
  const storeBlocks = useEditorStore((s) => s.blocks);
  const updateBlock = useEditorStore((s) => s.updateBlock);

  const blocks = props.editable ? storeBlocks : props.blocks;

  // prepare layout data for react-grid-layout
  const layout = blocks.map((b) => {
    const l = b.layout || { x: 0, y: Infinity, w: 1, h: 1 };
    return {
      i: b.id,
      x: l.x ?? 0,
      y: l.y ?? Infinity,
      w: l.w ?? spanForPreset(b.styles?.widthPreset ?? "full"),
      h: l.h ?? 1,
      static: l.static || false,
    };
  });

  const onLayoutChange = (newLayout: GridItem[]) => {
    // first update layout coordinates
    newLayout.forEach((l) => {
      const b = blocks.find((b) => b.id === l.i);
      if (b) {
        updateBlock(b.id, {
          layout: { x: l.x, y: l.y, w: l.w, h: l.h, static: l.static },
        });
      }
    });

    // recompute an explicit order value based on row-major sorting of layout
    const sorted = [...newLayout].sort((a, c) => {
      if (a.y !== c.y) return a.y - c.y;
      return a.x - c.x;
    });
    sorted.forEach((l, idx) => {
      const b = blocks.find((b) => b.id === l.i);
      if (b && b.order !== idx) {
        updateBlock(b.id, { order: idx });
      }
    });
  };

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={3}
      rowHeight={100}
      width={1200}
      onLayoutChange={onLayoutChange}
      isResizable={props.editable}
      isDraggable={props.editable}
      compactType={props.editable ? null : "vertical"}
    >
      {blocks.map((block: Block) => (
        <div
          key={block.id}
          data-grid={
            layout.find((l) => l.i === block.id) || {
              x: 0,
              y: Infinity,
              w: 1,
              h: 1,
            }
          }
        >
          {props.editable ? (
            <SortableBlock block={block} />
          ) : (
            <BlockRenderer block={block} />
          )}
        </div>
      ))}
    </GridLayout>
  );
};
