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

  const layout = blocks.map((b) => {
    const l = b.layout || { x: 0, y: Infinity, w: 1, h: 1 };
    return {
      i: b.id,
      x: l.x ?? 0,
      y: l.y ?? Infinity,
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
