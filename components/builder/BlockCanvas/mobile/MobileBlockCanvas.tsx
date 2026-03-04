"use client";

import type { Block } from "@/types/editor";
import { MobileCanvasGrid } from "@/components/builder/BlockCanvas/mobile/MobileCanvasGrid";

type MobileBlockCanvasProps = {
  editable: boolean;
  blocks: Block[];
  onUpdateBlock?: (id: string, updates: Partial<Block>) => void;
};

export const MobileBlockCanvas = ({
  editable,
  blocks,
  onUpdateBlock,
}: MobileBlockCanvasProps) => {
  if (editable) {
    if (!onUpdateBlock) return null;

    return (
      <MobileCanvasGrid
        editable
        blocks={blocks}
        onUpdateBlock={onUpdateBlock}
      />
    );
  }

  return <MobileCanvasGrid editable={false} blocks={blocks} />;
};
