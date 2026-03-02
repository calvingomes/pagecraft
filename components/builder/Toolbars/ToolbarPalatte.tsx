"use client";

import { LayoutTemplate, PanelLeft, PanelRight } from "lucide-react";
import styles from "./Toolbar.module.css";
import type {
  PageBackgroundOption,
  ToolbarPalatteProps,
} from "./Toolbar.types";

const PAGE_BG_OPTIONS: PageBackgroundOption[] = [
  { id: "page-bg-1", cssVar: "var(--color-page-bg-1)" },
  { id: "page-bg-2", cssVar: "var(--color-page-bg-2)" },
  { id: "page-bg-3", cssVar: "var(--color-page-bg-3)" },
  { id: "page-bg-4", cssVar: "var(--color-page-bg-4)" },
  { id: "page-bg-5", cssVar: "var(--color-page-bg-5)" },
  { id: "page-bg-6", cssVar: "var(--color-page-bg-6)" },
];

export const ToolbarPalatte = ({
  isOpen,
  onChangeBackground,
  onChangeSidebarPosition,
  background = "page-bg-1",
  sidebarPosition = "left",
}: ToolbarPalatteProps) => {
  if (!isOpen) return null;

  return (
    <div className={styles.palettePopover}>
      <div className={styles.paletteSection}>
        <span className={styles.paletteLabel}>Background</span>
        <div className={styles.colorSwatches}>
          {PAGE_BG_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`${styles.colorSwatch} ${
                background === option.id ? styles.colorSwatchSelected : ""
              }`}
              style={{ background: option.cssVar }}
              onClick={() => onChangeBackground?.(option.id)}
              aria-label={`Background ${option.id}`}
            />
          ))}
        </div>
      </div>
      <div className={styles.paletteDivider} />
      <div className={styles.paletteSection}>
        <span className={styles.paletteLabel}>Profile position</span>
        <div className={styles.sidebarPositionGroup}>
          <button
            type="button"
            className={`${styles.sidebarPositionBtn} ${
              sidebarPosition === "left" ? styles.sidebarPositionSelected : ""
            }`}
            onClick={() => onChangeSidebarPosition?.("left")}
            title="Profile on left"
            aria-label="Profile on left"
          >
            <PanelLeft size={18} />
          </button>
          <button
            type="button"
            className={`${styles.sidebarPositionBtn} ${
              sidebarPosition === "center" ? styles.sidebarPositionSelected : ""
            }`}
            onClick={() => onChangeSidebarPosition?.("center")}
            title="Profile in center"
            aria-label="Profile in center"
          >
            <LayoutTemplate size={18} />
          </button>
          <button
            type="button"
            className={`${styles.sidebarPositionBtn} ${
              sidebarPosition === "right" ? styles.sidebarPositionSelected : ""
            }`}
            onClick={() => onChangeSidebarPosition?.("right")}
            title="Profile on right"
            aria-label="Profile on right"
          >
            <PanelRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
