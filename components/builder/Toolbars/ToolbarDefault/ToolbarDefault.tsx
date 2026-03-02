"use client";

import { useCallback, useState } from "react";
import {
  Type,
  Link2,
  Image as ImageIcon,
  Palette,
  PanelLeft,
  PanelRight,
  LayoutTemplate,
} from "lucide-react";
import styles from "./Toolbar.module.css";
import { ToolbarLink } from "../ToolbarLink/ToolbarLink";

import type {
  PageBackgroundOption,
  ToolbarMode,
  ToolbarDefaultProps,
} from "../Toolbar.types";

const PAGE_BG_OPTIONS: PageBackgroundOption[] = [
  { id: "page-bg-1", cssVar: "var(--color-page-bg-1)" },
  { id: "page-bg-2", cssVar: "var(--color-page-bg-2)" },
  { id: "page-bg-3", cssVar: "var(--color-page-bg-3)" },
  { id: "page-bg-4", cssVar: "var(--color-page-bg-4)" },
  { id: "page-bg-5", cssVar: "var(--color-page-bg-5)" },
  { id: "page-bg-6", cssVar: "var(--color-page-bg-6)" },
];

export const ToolbarDefault = ({
  onAddBlock,
  onChangeBackground,
  onChangeSidebarPosition,
  background = "page-bg-1",
  sidebarPosition = "left",
}: ToolbarDefaultProps) => {
  const [mode, setMode] = useState<ToolbarMode>("default");
  const [linkUrl, setLinkUrl] = useState("");
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const handleCreateLink = useCallback(async () => {
    const url = linkUrl.trim();
    if (!url || !onAddBlock) return;
    await onAddBlock("link", { url });
    setLinkUrl("");
    setMode("default");
  }, [linkUrl, onAddBlock]);

  if (mode === "link") {
    return (
      <ToolbarLink
        linkUrl={linkUrl}
        onChangeLinkUrl={setLinkUrl}
        onBack={() => setMode("default")}
        onCreateLink={handleCreateLink}
      />
    );
  }

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
          onClick={() => setMode("link")}
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
      {isPaletteOpen && (
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
                  sidebarPosition === "left"
                    ? styles.sidebarPositionSelected
                    : ""
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
                  sidebarPosition === "center"
                    ? styles.sidebarPositionSelected
                    : ""
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
                  sidebarPosition === "right"
                    ? styles.sidebarPositionSelected
                    : ""
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
      )}
    </div>
  );
};
