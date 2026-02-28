"use client";

import { useCallback, useState } from "react";
import {
  Type,
  Link2,
  Image as ImageIcon,
  ArrowLeft,
  Palette,
} from "lucide-react";
import type { BlockType } from "@/types/editor";
import type { PageBackgroundId } from "@/types/page";
import styles from "./BlockToolbar.module.css";

type ToolbarMode = "default" | "link";

export type BlockToolbarProps = {
  onAddBlock?: (
    type: BlockType,
    options?: { url?: string; label?: string },
  ) => void | Promise<void>;
  onChangeBackground?: (background: PageBackgroundId) => void;
  background?: PageBackgroundId;
};

const PAGE_BG_OPTIONS: { id: PageBackgroundId; cssVar: string }[] = [
  { id: "page-bg-1", cssVar: "var(--color-page-bg-1)" },
  { id: "page-bg-2", cssVar: "var(--color-page-bg-2)" },
  { id: "page-bg-3", cssVar: "var(--color-page-bg-3)" },
  { id: "page-bg-4", cssVar: "var(--color-page-bg-4)" },
  { id: "page-bg-5", cssVar: "var(--color-page-bg-5)" },
  { id: "page-bg-6", cssVar: "var(--color-page-bg-6)" },
];

export const BlockToolbar = ({
  onAddBlock,
  onChangeBackground,
  background = "page-bg-1",
}: BlockToolbarProps) => {
  const [mode, setMode] = useState<ToolbarMode>("default");
  const [linkUrl, setLinkUrl] = useState("");
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const handleCreateLink = useCallback(async () => {
    const url = linkUrl.trim();
    if (!url || !onAddBlock) return;
    await onAddBlock("link", { url, label: url });
    setLinkUrl("");
    setMode("default");
  }, [linkUrl, onAddBlock]);

  const handlePasteAndCreate = useCallback(async () => {
    if (!navigator.clipboard?.readText || !onAddBlock) return;
    const text = (await navigator.clipboard.readText()).trim();
    if (!text) return;
    setLinkUrl(text);
    await onAddBlock("link", { url: text, label: text });
    setMode("default");
  }, [onAddBlock]);

  if (mode === "link") {
    return (
      <div className={styles.toolbarContainer}>
        <div className={styles.toolbarContentLink}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => setMode("default")}
            aria-label="Back to toolbar"
          >
            <ArrowLeft size={18} />
          </button>
          <div className={styles.linkInputWrapper}>
            <input
              className={styles.linkInput}
              placeholder="Add link here"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleCreateLink();
                }
              }}
            />
            <button
              type="button"
              className={styles.pasteButton}
              onClick={() => void handlePasteAndCreate()}
            >
              Paste
            </button>
          </div>
        </div>
      </div>
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
          {PAGE_BG_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`${styles.colorSwatch} ${
                background === option.id ? styles.colorSwatchSelected : ""
              }`}
              style={{ background: option.cssVar }}
              onClick={() => {
                onChangeBackground?.(option.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
