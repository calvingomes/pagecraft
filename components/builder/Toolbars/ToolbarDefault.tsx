"use client";

import { useState } from "react";
import { Type, Link2, Image as ImageIcon, Palette } from "lucide-react";
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
}: ToolbarDefaultProps) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

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
          onClick={() => onAddBlock?.("image")}
        >
          <ImageIcon size={18} />
        </button>
        <button
          className={`${styles.toolButton} ${styles.paletteTrigger}`}
          title="Background color"
          type="button"
          onClick={() => setIsPaletteOpen((open) => !open)}
        >
          <Palette size={18} />
        </button>
      </div>
      <ToolbarPalatte
        isOpen={isPaletteOpen}
        background={background}
        sidebarPosition={sidebarPosition}
        onChangeBackground={onChangeBackground}
        onChangeSidebarPosition={onChangeSidebarPosition}
      />
    </div>
  );
};
