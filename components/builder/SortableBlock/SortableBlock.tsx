"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";
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
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isPaletteHovered, setIsPaletteHovered] = useState(false);

  const selectedBlockId = editor?.selectedBlockId;
  const isActualMobile = editor?.isActualMobile ?? false;
  const isSelected = selectedBlockId === block.id;
  const viewport = gridConfig?.cols === 2 ? "mobile" : "desktop";
  const isMobile = viewport === "mobile";

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPaletteOpen(false);
  };

  const handlePaletteHoverChange = (isHoveringPortal: boolean) => {
    if (isHoveringPortal) {
      setIsPaletteHovered(true);
    } else {
      setIsPaletteHovered(false);
    }
  };

  const toolbarVisible = isActualMobile
    ? isSelected
    : isHovered || isPaletteHovered || isPaletteOpen;


  const handleClick = (e: React.MouseEvent) => {
    if (isActualMobile && editor) {
      if ((e.target as HTMLElement).closest("[role='toolbar']")) return;

      e.stopPropagation();

      if (isSelected) {
        editor.onFocusBlock(block.id);
      } else {
        editor.onSelectBlock(block.id);
      }
    }
  };

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
  const isTransparentWrapper = shouldUseTransparentWrapper(block.type, resolvedStyles);

  const isFocused = editor?.focusedBlockId === block.id;
  const showDeleteButton = isActualMobile ? isSelected : (isHovered && !!editor);

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
      className={`${styles.hoverZone} ${isSelected && isMobile ? styles.selectedZone : ""}`}
      style={fluid ? { height: "auto" } : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
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
          className={`${!isActualMobile ? "drag-handle" : ""} ${styles.wrapper} ${isSelected && isActualMobile ? styles.selected : ""
            } ${isTransparentWrapper ? styles.emptyWrapper : ""
            } ${(block.type === "text" || block.type === "link" || block.type === "image" || block.type === "sectionTitle") &&
              (!isTransparentWrapper || (toolbarVisible && !!editor && (block.type === "text" || block.type === "sectionTitle")))
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
                cursor: editor ? (isActualMobile ? "default" : "grab") : "default",
              }),
            backgroundColor: !isTransparentWrapper
              ? backgroundColor || "var(--color-white)"
              : !!editor && ((isHovered && !isActualMobile && (block.type === "text" || block.type === "sectionTitle")) || (isFocused && block.type === "sectionTitle"))
                ? "var(--color-white)"
                : "transparent",
            color: textColor,
            "--block-text-color": textColor,
            "--block-bg-color": !isTransparentWrapper
              ? backgroundColor || "var(--color-white)"
              : !!editor && ((isHovered && !isActualMobile && (block.type === "text" || block.type === "sectionTitle")) || (isFocused && block.type === "sectionTitle"))
                ? "var(--color-white)"
                : "transparent",
          } as React.CSSProperties & { [key: string]: string | number }}
        >
          {isActualMobile && isSelected && (
            <div className={`drag-handle ${styles.mobileDragHandle}`}>
              <GripVertical size={18} />
            </div>
          )}
          <div className={styles.content}>
            <div className={styles.blockContent}>
              <BlockRenderer block={block} />
            </div>
          </div>
        </div>

        {showDeleteButton && (
          <DeleteButtonCorner
            onClick={() => {
              editor?.onRemoveBlock(block.id);
              if (isActualMobile) editor?.onSelectBlock(null);
            }}
          />
        )}

        {!isActualMobile && showHoverToolbar && (
          <BlockHoverToolbar
            blockId={block.id}
            blockType={block.type}
            currentPreset={widthPreset}
            currentBackgroundColor={backgroundColor}
            isTransparentBackground={isTransparentWrapper}
            onWidthChange={handleWidthChange}
            onBackgroundColorChange={handleBackgroundColorChange as (color: string | null) => void}
            onPaletteOpenChange={setIsPaletteOpen}
            onPaletteHoverChange={handlePaletteHoverChange}
            visible={toolbarVisible}
            viewport={viewport}
          />
        )}
      </div>
    </div>
  );
}
