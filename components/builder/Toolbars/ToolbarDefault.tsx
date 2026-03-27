/* eslint-disable css-modules/no-unused-class */
"use client";

import { useRef, useState, type ChangeEvent } from "react";
import {
  Type,
  Link2,
  Image as ImageIcon,
  Palette,
  Heading,
} from "lucide-react";
import styles from "./Toolbar.module.css";
import type { ToolbarDefaultProps } from "./Toolbar.types";
import { ToolbarPalatte } from "./ToolbarPalatte";

export const ToolbarDefault = ({
  onAddBlock,
  onOpenLink,
  onChangeBackground,
  onChangeSidebarPosition,
  background = "page-bg-1",
  sidebarPosition = "left",
  showSidebarPositionControls = true,
}: ToolbarDefaultProps) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    onAddBlock?.("image", { file, alt: file.name });
    event.currentTarget.value = "";
  };

  return (
    <div className={styles.toolbarContainer}>
      <div className={styles.toolbarContent}>
        <button
          className={styles.toolButton}
          title="Text"
          type="button"
          onClick={() => onAddBlock?.("text")}
        >
          <Type size={18} />
        </button>
        <button
          className={styles.toolButton}
          title="Link"
          type="button"
          onClick={onOpenLink}
        >
          <Link2 size={18} />
        </button>
        <button
          className={styles.toolButton}
          title="Image"
          type="button"
          onClick={handleImageClick}
        >
          <ImageIcon size={18} />
        </button>
        <button
          className={styles.toolButton}
          title="Section title"
          type="button"
          onClick={() => onAddBlock?.("sectionTitle")}
        >
          <Heading size={18} />
        </button>
        <button
          className={styles.toolButton}
          title="Background color"
          type="button"
          onClick={() => setIsPaletteOpen((open) => !open)}
        >
          <Palette size={18} />
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleImageChange}
          hidden
        />
      </div>
      <ToolbarPalatte
        isOpen={isPaletteOpen}
        background={background}
        sidebarPosition={sidebarPosition}
        onChangeBackground={onChangeBackground}
        onChangeSidebarPosition={onChangeSidebarPosition}
        showSidebarPositionControls={showSidebarPositionControls}
      />
    </div>
  );
};
