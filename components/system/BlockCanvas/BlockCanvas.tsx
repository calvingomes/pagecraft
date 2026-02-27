"use client";

import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEditorStore } from "@/stores/editor-store";
import { BlockItem } from "@/components/system/BlockItem";
import styles from "./BlockCanvas.module.css";

export const BlockCanvas = () => {
  const blocks = useEditorStore((s) => s.blocks);
  const updateBlock = useEditorStore((s) => s.updateBlock);
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
              <BlockItem block={block} />
              {block.type === "text" && (
                <textarea
                  className={styles.textarea}
                  value={block.content?.text || ""}
                  onChange={(e) =>
                    updateBlock(block.id, {
                      content: { text: e.target.value },
                    })
                  }
                />
              )}
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
