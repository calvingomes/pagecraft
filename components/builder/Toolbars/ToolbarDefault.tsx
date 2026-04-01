/* eslint-disable css-modules/no-unused-class */
"use client";

import * as Popover from "@radix-ui/react-popover";
import * as Toolbar from "@radix-ui/react-toolbar";
import { useRef, useState, type ChangeEvent } from "react";
import { TogglePill } from "@/components/ui/TogglePill/TogglePill";
import {
  Type,
  Link2,
  Image as ImageIcon,
  Palette,
  Heading,
  Laptop,
  Smartphone,
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
  previewViewport = "desktop",
  onViewportChange,
  username,
}: ToolbarDefaultProps) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [toolbarWidth, setToolbarWidth] = useState<number | null>(null);
  const toolbarContainerRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const handlePaletteOpenChange = (nextOpen: boolean) => {
    if (nextOpen && toolbarContainerRef.current) {
      setToolbarWidth(Math.round(toolbarContainerRef.current.offsetWidth));
    }

    setIsPaletteOpen(nextOpen);
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    onAddBlock?.("image", { file, alt: file.name });
    event.currentTarget.value = "";
  };

  const handleCopyLink = () => {
    if (!username) return;
    const url = `${window.location.protocol}//${window.location.host}/${username}`;
    navigator.clipboard.writeText(url);
    
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className={styles.toolbarContainer} ref={toolbarContainerRef}>
      <Toolbar.Root
        className={styles.toolbarContent}
        aria-label="Add block toolbar"
      >
        <Toolbar.Button
          className={`${styles.toolButton} ${styles.copyButton} ${isCopied ? styles.copyButtonActive : ""}`}
          title={isCopied ? "Copied!" : "Share"}
          type="button"
          onClick={handleCopyLink}
          aria-label={isCopied ? "Link copied" : "Copy public link"}
        >
          {isCopied ? "Link copied!" : "Copy Link"}
        </Toolbar.Button>

        <div className={styles.divider} />

        <Toolbar.Button
          className={styles.toolButton}
          title="Text"
          type="button"
          onClick={() => onAddBlock?.("text")}
          aria-label="Add text block"
        >
          <Type size={18} />
        </Toolbar.Button>
        <Toolbar.Button
          className={styles.toolButton}
          title="Link"
          type="button"
          onClick={onOpenLink}
          aria-label="Add link block"
        >
          <Link2 size={18} />
        </Toolbar.Button>
        <Toolbar.Button
          className={styles.toolButton}
          title="Image"
          type="button"
          onClick={handleImageClick}
          aria-label="Add image block"
        >
          <ImageIcon size={18} />
        </Toolbar.Button>
        <Toolbar.Button
          className={styles.toolButton}
          title="Section title"
          type="button"
          onClick={() => onAddBlock?.("sectionTitle")}
          aria-label="Add section title block"
        >
          <Heading size={18} />
        </Toolbar.Button>
        <Popover.Root
          open={isPaletteOpen}
          onOpenChange={handlePaletteOpenChange}
        >
          <Popover.Trigger asChild>
            <Toolbar.Button
              className={styles.toolButton}
              title="Background color"
              type="button"
              data-toolbar-role="palette"
              aria-label="Background color"
            >
              <Palette size={18} />
            </Toolbar.Button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="top"
              align="end"
              sideOffset={8}
              className={styles.popoverContent}
              style={toolbarWidth ? { width: `${toolbarWidth}px` } : undefined}
            >
              <ToolbarPalatte
                background={background}
                sidebarPosition={sidebarPosition}
                onChangeBackground={onChangeBackground}
                onChangeSidebarPosition={onChangeSidebarPosition}
                showSidebarPositionControls={showSidebarPositionControls}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        <div className={styles.divider} />
        <TogglePill
          value={previewViewport}
          onChange={onViewportChange || (() => {})}
          variant="toolbar"
          showBackground={false}
          options={[
            {
              value: "desktop",
              label: <Laptop size={20} />,
              ariaLabel: "Preview desktop view",
            },
            {
              value: "mobile",
              label: <Smartphone size={20} />,
              ariaLabel: "Preview mobile view",
            },
          ]}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleImageChange}
          hidden
        />
      </Toolbar.Root>
    </div>
  );
};
