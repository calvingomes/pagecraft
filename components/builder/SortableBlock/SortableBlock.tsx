"use client";

import { useState, useCallback } from "react";
import type { Block, BlockWidthPreset } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import BlockRenderer from "@/components/builder/BlockRenderer/BlockRenderer";
import { BlockHoverToolbar } from "@/components/builder/BlockHoverToolbar/BlockHoverToolbar";
import styles from "./SortableBlock.module.css";

// same preset-to-columns mapping used by BlockCanvas
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

interface SortableBlockProps {
  block: Block;
}

export function SortableBlock({ block }: SortableBlockProps) {
  const editor = useEditorContext();
  const [isHovered, setIsHovered] = useState(false);

  const widthPreset = block.styles?.widthPreset ?? "narrow";
  const rowBreak = block.layout?.y === Infinity;

  const handleWidthChange = useCallback(
    (preset: BlockWidthPreset) => {
      const newW = spanForPreset(preset);
      editor?.onUpdateBlock(block.id, {
        styles: { ...block.styles, widthPreset: preset },
        layout: { ...block.layout, w: newW },
      });
    },
    [editor, block.id, block.styles, block.layout],
  );

  const handleToggleRowBreak = useCallback(() => {
    editor?.onUpdateBlock(block.id, {
      layout: {
        ...block.layout,
        y: rowBreak ? undefined : Infinity,
      },
    });
  }, [editor, block.id, block.layout, rowBreak]);

  // no extra styles needed; grid handles positioning
  const wrapperStyle: React.CSSProperties = {};

  return (
    <div
      className={styles.hoverZone}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={wrapperStyle} className={styles.wrapper}>
        {editor && (
          <BlockHoverToolbar
            blockId={block.id}
            currentPreset={widthPreset}
            onWidthChange={handleWidthChange}
            rowBreak={rowBreak}
            onToggleRowBreak={handleToggleRowBreak}
            visible={isHovered}
          />
        )}
        <div className={styles.content}>
          <div className={styles.blockContent}>
            <BlockRenderer block={block} />
          </div>
        </div>
      </div>
    </div>
  );
}
