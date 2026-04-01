"use client";

import { useState } from "react";
import type { BlockWidthPreset } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import { DeleteButtonCorner } from "@/components/builder/DeleteButtonCorner/DeleteButtonCorner";
import BlockRenderer from "@/components/builder/BlockRenderer/BlockRenderer";
import { BlockHoverToolbar } from "@/components/builder/HoverToolbar/BlockHoverToolbar/BlockHoverToolbar";
import styles from "./SortableBlock.module.css";
import { shouldUseTransparentWrapper } from "@/lib/blockWrapper";
import type { SortableBlockProps } from "@/types/builder";
import { deriveTextColor } from "@/lib/utils/colorUtils";

export function SortableBlock({
  block,
  dimensions,
  fluid = false,
  gridConfig,
}: SortableBlockProps) {
  const editor = useEditorContext();
  const [isHovered, setIsHovered] = useState(false);

  const toolbarVisible = isHovered;

  const viewport = gridConfig?.cols === 2 ? "mobile" : "desktop";

  const handleWidthChange = (preset: BlockWidthPreset) => {
    if (!editor?.onUpdateBlock) return;
    const stylesKey = viewport === "mobile" ? "mobileStyles" : "styles";
    const currentStyles =
      viewport === "mobile" ? block.mobileStyles : block.styles;
    editor.onUpdateBlock(block.id, {
      [stylesKey]: { ...(currentStyles ?? {}), widthPreset: preset },
    });
  };

  const handleBackgroundColorChange = (color: string | null) => {
    if (!editor?.onUpdateBlock) return;
    const stylesKey = viewport === "mobile" ? "mobileStyles" : "styles";
    const currentStyles =
      viewport === "mobile" ? block.mobileStyles : block.styles;

    if (color === null) {
      editor.onUpdateBlock(block.id, {
        [stylesKey]: {
          ...(currentStyles ?? {}),
          transparentWrapper: true,
          backgroundColor: undefined,
        },
      });
    } else {
      editor.onUpdateBlock(block.id, {
        [stylesKey]: {
          ...(currentStyles ?? {}),
          transparentWrapper: false,
          backgroundColor: color,
        },
      });
    }
  };

  const resolvedStyles = viewport === "mobile" 
    ? { ...block.styles, ...block.mobileStyles } 
    : block.styles;

  const widthPreset = resolvedStyles?.widthPreset ?? "small";
  const showHoverToolbar = !!editor && block.type !== "sectionTitle";
  const renderMode = editor ? "edit" : "view";
  const isTransparentWrapper = shouldUseTransparentWrapper(block, renderMode);

  const { widthPx, heightPx } = dimensions;
  const aspectRatio = `${widthPx} / ${heightPx}`;
  const backgroundColor = resolvedStyles?.backgroundColor;

  const textColor = deriveTextColor(
    !isTransparentWrapper
      ? backgroundColor || "var(--color-white)"
      : "var(--color-white)"
  );

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
          className={`drag-handle ${styles.wrapper} ${
            isTransparentWrapper ? styles.emptyWrapper : ""
          } ${
            (block.type === "text" || block.type === "link" || block.type === "image") &&
            !isTransparentWrapper
              ? styles.bordered
              : ""
          }`}
          style={{
            ...(fluid
              ? {
                  width: "100%",
                  height: "auto",
                  aspectRatio,
                }
              : {
                  width: `${widthPx}px`,
                  height: `${heightPx}px`,
                  cursor: editor ? "grab" : "default",
                }),
            backgroundColor: !isTransparentWrapper
              ? backgroundColor || "var(--color-white)"
              : "transparent",
            color: textColor,
            "--block-text-color": textColor,
            "--block-bg-color": !isTransparentWrapper
              ? backgroundColor || "var(--color-white)"
              : "transparent",
          } as React.CSSProperties & { [key: string]: string | number }}
        >
          <div className={styles.content}>
            <div className={styles.blockContent}>
              <BlockRenderer block={block} />
            </div>
          </div>
        </div>

        {!!editor && isHovered && (
          <DeleteButtonCorner
            onClick={() => editor.onRemoveBlock(block.id)}
          />
        )}

        {showHoverToolbar && (
          <BlockHoverToolbar
            blockId={block.id}
            blockType={block.type}
            currentPreset={widthPreset}
            currentBackgroundColor={backgroundColor}
            onWidthChange={handleWidthChange}
            onBackgroundColorChange={handleBackgroundColorChange as (color: string) => void}
            visible={toolbarVisible}
            viewport={viewport}
          />
        )}
      </div>
    </div>
  );
}
