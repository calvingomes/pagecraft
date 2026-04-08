/* eslint-disable css-modules/no-unused-class */
import React, { useMemo } from "react";
import type { Block } from "@/types/editor";
import type { BlockCanvasRenderMode } from "@/types/builder";
import { DESKTOP_GRID, MOBILE_GRID } from "@/lib/editor-engine/grid/grid-config";
import { sizePxForBlock, blockToStyle, rectForBlock } from "@/lib/editor-engine/grid/grid-math";
import { SortableBlock } from "@/components/builder/SortableBlock/SortableBlock";
import { useResponsiveZoom } from "@/hooks/useResponsiveZoom";
import styles from "./BlockCanvas.module.css";

type ReadOnlyGridProps = {
  blocks: Block[];
  renderMode: BlockCanvasRenderMode;
};

export const ReadOnlyGrid = ({ blocks, renderMode }: ReadOnlyGridProps) => {
  const isMobile = renderMode === "mobile";
  const config = isMobile ? MOBILE_GRID : DESKTOP_GRID;

  const { containerRef, zoom } = useResponsiveZoom(MOBILE_GRID.canvasPx, isMobile);

  const visibleBlocks = useMemo(() => {
    return blocks
      .filter((b) => (isMobile ? b.visibility?.mobile !== false : b.visibility?.desktop !== false))
      .map((b) => ({
        ...b,
        layout: isMobile ? (b.mobileLayout ?? b.layout) : b.layout,
        styles: isMobile ? { ...b.styles, ...b.mobileStyles } : b.styles,
      }) as Block);
  }, [blocks, isMobile]);

  // Calculate container height to prevent collapse
  const maxLatentY = visibleBlocks.reduce((max, b) => {
    const { y, h } = rectForBlock(b, undefined, config);
    return Math.max(max, y + h);
  }, 0);

  const containerHeight = Math.round(maxLatentY * (config.cellPx + config.gapYPx));
  
  // Setup zoom style while avoiding hydration mismatch
  const canvasStyle: React.CSSProperties = {
    position: "relative",
    height: `${containerHeight}px`,
    width: `${config.canvasPx}px`,
    margin: "0 auto",
  };

  if (isMobile && zoom < 1) {
    canvasStyle.zoom = zoom;
    canvasStyle.maxWidth = "none";
  }

  const scaledHeight = isMobile ? Math.round(containerHeight * zoom) : containerHeight;

  return (
    <div 
      ref={containerRef} 
      className={styles.gridContainer}
      style={{ 
        width: "100%", 
        overflow: "hidden",
        minHeight: `${scaledHeight}px`,
        "--grid-height": `${containerHeight}px`,
      } as React.CSSProperties}
    >
      <div
        className={styles.canvas}
        style={canvasStyle}
      >
        {visibleBlocks.map((block) => {
          const itemStyle = blockToStyle(block, config);
          const dimensions = sizePxForBlock(block, config);

          return (
            <div key={block.id} style={itemStyle}>
              <SortableBlock
                block={block}
                dimensions={dimensions}
                gridConfig={config}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
