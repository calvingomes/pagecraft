"use client";

import React from "react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { GridLayout } from "react-grid-layout";
interface GridItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
}
import { useEditorStore } from "@/stores/editor-store";
import BlockRenderer from "@/components/builder/BlockRenderer/BlockRenderer";
import { SortableBlock } from "@/components/builder/SortableBlock/SortableBlock";
import type { Block, BlockWidthPreset } from "@/types/editor";

type BlockCanvasProps =
  | { editable: true }
  | { editable: false; blocks: Block[]; title?: string };

const spanForPreset = (preset: BlockWidthPreset): number => {
  switch (preset) {
    case "narrow":
      return 1;
    case "medium":
      return 2;
    default:
      return 3;
  }
};

export const BlockCanvas = (props: BlockCanvasProps) => {
  const storeBlocks = useEditorStore((s) => s.blocks);
  const updateBlock = useEditorStore((s) => s.updateBlock);

  const blocks = props.editable ? storeBlocks : props.blocks;

  const cols = 3;
  const layout = blocks.map((b, idx) => {
    const l = b.layout || {};
    // place based on saved coords if available, otherwise fall back to order-based grid
    const defaultX = idx % cols;
    const defaultY = Math.floor(idx / cols);
    return {
      i: b.id,
      x: l.x ?? defaultX,
      y: l.y ?? defaultY,
      w: l.w ?? spanForPreset(b.styles?.widthPreset ?? "narrow"),
      h: l.h ?? 1,
      static: l.static || false,
    };
  });

  const onLayoutChange = (newLayout: GridItem[]) => {
    newLayout.forEach((l) => {
      const b = blocks.find((b) => b.id === l.i);
      if (b) {
        updateBlock(b.id, {
          layout: { x: l.x, y: l.y, w: l.w, h: l.h, static: l.static },
        });
      }
    });

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
      rowHeight={150}
      width={1200}
      onLayoutChange={onLayoutChange}
      isResizable={false}
      isDraggable={props.editable}
      preventCollision={true}
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
          style={{ width: "100%", height: "100%" }}
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
