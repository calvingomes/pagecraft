/* eslint-disable css-modules/no-unused-class */
"use client";

import * as Popover from "@radix-ui/react-popover";
import * as Toolbar from "@radix-ui/react-toolbar";
import { useRef, useState, type ChangeEvent } from "react";
import { TogglePill } from "@/components/ui/TogglePill/TogglePill";
import {
  Palette,
  Laptop,
  Smartphone,
  LogOut,
  Plus,
} from "lucide-react";
import styles from "./Toolbar.module.css";
import type { ToolbarDefaultProps } from "./Toolbar.types";
import { ToolbarPalette } from "./ToolbarPalette";
import { WidgetMenu } from "./WidgetMenu";

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
  isSaving = false,
  onLogout,
}: ToolbarDefaultProps) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
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

  const handleCopyLink = () => {
    if (!username) return;
    const url = `${window.location.protocol}//${window.location.host}/${username}`;
    navigator.clipboard.writeText(url);
    
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 500);
  };

  return (
    <div className={styles.toolbarContainer}>
      <Toolbar.Root
        className={styles.toolbarContent}
        aria-label="Add block toolbar"
      >
        <Toolbar.Button
          className={`${styles.toolButton} ${styles.copyButton} ${isCopied ? styles.copyButtonActive : ""} ${isSaving ? styles.copyButtonSaving : ""}`}
          title={isSaving ? "Saving changes..." : isCopied ? "Copied!" : "Share"}
          type="button"
          onClick={handleCopyLink}
          disabled={isSaving}
          aria-label={isSaving ? "Saving changes" : isCopied ? "Link copied" : "Copy public link"}
        >
          {isSaving ? "Saving..." : isCopied ? "Link copied!" : "Copy Link"}
        </Toolbar.Button>

        <div className={styles.divider} />

        <WidgetMenu 
          onAddBlock={onAddBlock} 
          onOpenLink={onOpenLink} 
          onImageClick={handleImageClick} 
        />
        <Popover.Root
          open={isPaletteOpen}
          onOpenChange={setIsPaletteOpen}
          modal={false}
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
              align="center"
              sideOffset={14}
              className={styles.popoverContent}
            >
              <ToolbarPalette
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
        <div className={`${styles.divider} ${styles.logoutDivider}`} />
        <Toolbar.Button
          className={`${styles.toolButton} ${styles.logoutButton}`}
          title="Logout"
          type="button"
          onClick={onLogout}
          aria-label="Logout"
        >
          <LogOut size={18} />
        </Toolbar.Button>
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
