"use client";

import type { Block } from "@/types/editor";
import { MobileCanvasGrid } from "@/components/builder/BlockCanvas/mobile/MobileCanvasGrid";

type MobileBlockCanvasProps = {
  editable: boolean;
  blocks: Block[];
  onReorder?: (activeId: string, overId: string) => void;
};

export const MobileBlockCanvas = ({
  editable,
  blocks,
  onReorder,
}: MobileBlockCanvasProps) => {
  if (editable) {
    if (!onReorder) return null;

    return <MobileCanvasGrid editable blocks={blocks} onReorder={onReorder} />;
  }

  return <MobileCanvasGrid editable={false} blocks={blocks} />;
};
