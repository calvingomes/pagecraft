"use client";

import { useState } from "react";
import type { BlockWidthPreset } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import BlockRenderer from "@/components/builder/BlockRenderer/BlockRenderer";
import { BlockHoverToolbar } from "@/components/builder/HoverToolbar/BlockHoverToolbar/BlockHoverToolbar";
import styles from "./SortableBlock.module.css";
import { shouldUseTransparentWrapper } from "@/lib/blockWrapper";
import type { SortableBlockProps } from "@/types/builder";

export function SortableBlock({
  block,
  dimensions,
  fluid = false,
  gridConfig,
}: SortableBlockProps) {
  const editor = useEditorContext();
  const [isHovered, setIsHovered] = useState(false);

  const toolbarVisible = isHovered;

  const widthPreset = block.styles?.widthPreset ?? "small";
  const showHoverToolbar = !!editor && block.type !== "sectionTitle";
  const renderMode = editor ? "edit" : "view";
  const isTransparentWrapper = shouldUseTransparentWrapper(block, renderMode);
  const viewport = gridConfig?.cols === 2 ? "mobile" : "desktop";

  const handleWidthChange = (preset: BlockWidthPreset) => {
    if (!editor?.onUpdateBlock) return;
    const stylesKey = viewport === "mobile" ? "mobileStyles" : "styles";
    const currentStyles = viewport === "mobile" ? block.mobileStyles : block.styles;
    editor.onUpdateBlock(block.id, {
      [stylesKey]: { ...(currentStyles ?? {}), widthPreset: preset },
    });
  };

  const handleToggleWrapperBackground = () => {
    if (!editor?.onUpdateBlock) return;
    const canToggleBackground = block.type === "text" || block.type === "link";
    if (!canToggleBackground) return;

    editor.onUpdateBlock(block.id, {
      styles: {
        ...block.styles,
        transparentWrapper: !isTransparentWrapper,
      },
    });
  };

  const { widthPx, heightPx } = dimensions;
  const aspectRatio = `${widthPx} / ${heightPx}`;

  return (
    <div
      className={styles.hoverZone}
      style={fluid ? { height: "auto" } : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={styles.frame}
        style={{
          ...(fluid ? { width: "100%" } : {}),
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      >
        <div
          className={`drag-handle ${styles.wrapper} ${isTransparentWrapper ? styles.emptyWrapper : ""}`}
          style={
            fluid
              ? {
                  width: "100%",
                  height: "auto",
                  aspectRatio,
                }
              : {
                  width: `${widthPx}px`,
                  height: `${heightPx}px`,
                  cursor: editor ? "grab" : "default",
                }
          }
        >
          <div className={styles.content}>
            <div className={styles.blockContent}>
              <BlockRenderer block={block} />
            </div>
          </div>
        </div>

        {showHoverToolbar && (
          <BlockHoverToolbar
            blockId={block.id}
            blockType={block.type}
            currentPreset={widthPreset}
            currentTransparentWrapper={isTransparentWrapper}
            onWidthChange={handleWidthChange}
            onToggleWrapperBackground={handleToggleWrapperBackground}
            visible={toolbarVisible}
            viewport={viewport}
          />
        )}
      </div>
    </div>
  );
}
