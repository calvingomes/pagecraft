"use client";

import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEditorStore } from "@/stores/editor-store";
import { SortableBlock } from "@/components/builder/SortableBlock/SortableBlock";
import BlockRenderer from "@/components/builder/BlockRenderer/BlockRenderer";
import type { Block, BlockWidthPreset } from "@/types/editor";
import styles from "./BlockCanvas.module.css";

const WIDTH_PRESET_MAX: Record<BlockWidthPreset, string> = {
  narrow: "320px",
  medium: "560px",
  wide: "720px",
  full: "100%",
};

type BlockCanvasProps =
  | { editable: true }
  | { editable: false; blocks: Block[]; title?: string };

export const BlockCanvas = (props: BlockCanvasProps) => {
  const storeBlocks = useEditorStore((s) => s.blocks);
  const reorderBlocks = useEditorStore((s) => s.reorderBlocks);
  const blocks = props.editable ? storeBlocks : props.blocks;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderBlocks(active.id as string, over.id as string);
  };

  if (props.editable) {
    return (
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={styles.canvas}>
            {blocks.map((block) => (
              <SortableBlock key={block.id} block={block} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  return (
    <div className={styles.canvas}>
      {props.title && <h1 className={styles.pageTitle}>{props.title}</h1>}
      {blocks.map((block) => {
        const widthPreset = block.styles?.widthPreset ?? "full";
        const maxWidth = WIDTH_PRESET_MAX[widthPreset];
        return (
          <div key={block.id} className={styles.readOnlyBlock}>
            <div className={styles.blockContent} style={{ maxWidth }}>
              <BlockRenderer block={block} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
