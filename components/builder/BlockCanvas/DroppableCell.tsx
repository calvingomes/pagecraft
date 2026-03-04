"use client";

import { useDroppable } from "@dnd-kit/core";
import { memo } from "react";
import styles from "./BlockCanvas.module.css";

export const DroppableCell = memo(({ x, y }: { x: number; y: number }) => {
  const { setNodeRef } = useDroppable({
    id: `cell:${x}:${y}`,
    data: { type: "cell", x, y },
  });

  return <div ref={setNodeRef} className={styles.dropCell} />;
});

DroppableCell.displayName = "DroppableCell";
