"use client";

import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEditorStore } from "@/stores/editor-store";
import BlockRenderer from "@/components/system/BlockRenderer";
import styles from "./BlockCanvas.module.css";

export const BlockCanvas = () => {
  const blocks = useEditorStore((s) => s.blocks);
  const reorderBlocks = useEditorStore((s) => s.reorderBlocks);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderBlocks(active.id as string, over.id as string);
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={styles.canvas}>
          {blocks.map((block) => (
            <div key={block.id} className={styles.blockWrapper}>
              <BlockRenderer block={block} />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
