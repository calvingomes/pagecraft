"use client";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block } from "@/types/editor";
import styles from "../BlockCanvas.module.css";
import { SortableBlock } from "@/components/builder/SortableBlock/SortableBlock";
import { MobileReadonlyBlock } from "./MobileReadonlyBlock";
import { MOBILE_GRID, sizePxForBlock, spansForBlock } from "@/lib/blockGrid";
import { snapToCursor } from "@/lib/dndKit";

type MobileCanvasGridProps =
  | {
      editable: true;
      blocks: Block[];
      onReorder: (activeId: string, overId: string) => void;
    }
  | {
      editable: false;
      blocks: Block[];
    };

function MobileSortableGridItem({ block }: { block: Block }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const span = spansForBlock(block, undefined, MOBILE_GRID).w;
  const dimensions = sizePxForBlock(block, MOBILE_GRID);

  return (
    <div
      ref={setNodeRef}
      className={styles.gridMobileItem}
      style={{
        gridColumn: `span ${span}`,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        touchAction: "manipulation",
      }}
      {...attributes}
      {...listeners}
    >
      <SortableBlock
        block={block}
        dimensions={dimensions}
        fluid
        dndDisabled
        gridConfig={MOBILE_GRID}
      />
    </div>
  );
}

const orderByStableOrder = (blocks: Block[]) =>
  [...blocks].sort((a, b) => {
    const ao = typeof a.order === "number" ? a.order : 0;
    const bo = typeof b.order === "number" ? b.order : 0;
    if (ao !== bo) return ao - bo;
    return a.id.localeCompare(b.id);
  });

export function MobileCanvasGrid(props: MobileCanvasGridProps) {
  const ordered = orderByStableOrder(props.blocks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  if (!props.editable) {
    return (
      <div className={styles.canvas}>
        <div className={styles.gridMobile}>
          {ordered.map((block) => {
            const span = spansForBlock(block, undefined, MOBILE_GRID).w;
            const dimensions = sizePxForBlock(block, MOBILE_GRID);
            return (
              <div
                key={block.id}
                className={styles.gridMobileItem}
                style={{ gridColumn: `span ${span}` }}
              >
                <MobileReadonlyBlock block={block} dimensions={dimensions} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;
    props.onReorder(activeId, overId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={snapToCursor}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.canvas}>
        <div className={styles.gridMobile}>
          <SortableContext
            items={ordered.map((b) => b.id)}
            strategy={rectSortingStrategy}
          >
            {ordered.map((block) => (
              <MobileSortableGridItem key={block.id} block={block} />
            ))}
          </SortableContext>
        </div>
      </div>
    </DndContext>
  );
}
