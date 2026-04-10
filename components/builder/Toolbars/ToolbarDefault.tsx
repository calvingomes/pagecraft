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
} from "lucide-react";
import styles from "./Toolbar.module.css";
import type { ToolbarDefaultProps } from "./Toolbar.types";
import { ToolbarPalette } from "./ToolbarPalette";
import { Tooltip } from "@/components/ui/Tooltip/Tooltip";
import { WidgetMenu } from "./WidgetMenu";
import { useEditorContext } from "@/contexts/EditorContext";

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
  onLogout,
}: ToolbarDefaultProps) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const editor = useEditorContext();
  const isActualMobile = editor?.isActualMobile ?? false;

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
    if (!allowedTypes.has(file.type)) {
      event.currentTarget.value = "";
      return;
    }

    onAddBlock?.("image", { file, alt: file.name });
    event.currentTarget.value = "";
  };

  return (
    <div className={styles.toolbarContainer}>
      <Toolbar.Root
        className={styles.toolbarContent}
        aria-label="Add block toolbar"
      >
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
          <Tooltip content="Background & Alignment" side="top">
            <Popover.Trigger asChild>
              <Toolbar.Button
                className={styles.toolButton}
                title=""
                type="button"
                data-toolbar-role="palette"
                aria-label="Background color"
              >
                <Palette size={18} />
              </Toolbar.Button>
            </Popover.Trigger>
          </Tooltip>
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
        {!isActualMobile && (
          <>
            <div className={styles.divider} />
            <TogglePill
              value={previewViewport}
              onChange={onViewportChange || (() => { })}
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
          </>
        )}
        <div className={styles.divider} />
        <Tooltip content="Sign out" side="top">
          <Toolbar.Button
            className={`${styles.toolButton} ${styles.logoutButton}`}
            title=""
            type="button"
            onClick={onLogout}
            aria-label="Logout"
          >
            <LogOut size={18} />
          </Toolbar.Button>
        </Tooltip>
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
