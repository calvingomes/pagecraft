/* eslint-disable css-modules/no-unused-class */
"use client";

import { LayoutTemplate, PanelLeft, PanelRight } from "lucide-react";
import { TogglePill } from "@/components/ui/TogglePill/TogglePill";
import styles from "./Toolbar.module.css";
import type {
  PageBackgroundOption,
  ToolbarPaletteProps,
} from "./Toolbar.types";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { memo } from "react";

const PAGE_BG_OPTIONS: PageBackgroundOption[] = [
  { id: "page-bg-1", cssVar: "var(--color-editor-page-bg-1)" },
  { id: "page-bg-2", cssVar: "var(--color-editor-page-bg-2)" },
  { id: "page-bg-3", cssVar: "var(--color-editor-page-bg-3)" },
  { id: "page-bg-4", cssVar: "var(--color-editor-page-bg-4)" },
  { id: "page-bg-5", cssVar: "var(--color-editor-page-bg-5)" },
  { id: "page-bg-6", cssVar: "var(--color-editor-page-bg-6)" },
  { id: "page-bg-7", cssVar: "var(--color-editor-page-bg-7)" },
  { id: "page-bg-8", cssVar: "var(--color-editor-page-bg-8)" },
  { id: "page-bg-9", cssVar: "var(--color-editor-page-bg-9)" },
  { id: "white", cssVar: "var(--color-editor-page-bg-white)" },
];

export const ToolbarPalette = memo(({
  onChangeBackground,
  onChangeSidebarPosition,
  background = "page-bg-1",
  sidebarPosition = "left",
  showSidebarPositionControls = true,
}: ToolbarPaletteProps) => {
  return (
    <div className={styles.palettePopover}>
      <div className={styles.paletteSection}>
        <RadioGroup.Root
          className={styles.colorSwatches}
          value={background}
          onValueChange={(next) =>
            onChangeBackground?.(next as PageBackgroundOption["id"])
          }
          aria-label="Background"
        >
          {PAGE_BG_OPTIONS.map((option) => (
            <RadioGroup.Item
              key={option.id}
              className={`${styles.colorSwatch} ${
                background === option.id ? styles.colorSwatchSelected : ""
              }`}
              value={option.id}
              aria-label={`Background ${option.id}`}
            >
              <div
                className={styles.colorSwatchInner}
                style={{ backgroundColor: option.cssVar }}
              />
            </RadioGroup.Item>
          ))}
        </RadioGroup.Root>
      </div>
      {showSidebarPositionControls && (
        <div className={styles.paletteSection}>
          <div className={styles.paletteDivider} />
          <div className={styles.togglePillContainer}>
            <TogglePill
              value={sidebarPosition}
              onChange={(next) =>
                onChangeSidebarPosition?.(next as "left" | "center" | "right")
              }
              variant="toolbar"
              showBackground={false}
              fullWidth={true}
              options={[
                {
                  value: "left",
                  label: <PanelLeft size={18} />,
                  ariaLabel: "Profile on left",
                },
                {
                  value: "center",
                  label: <LayoutTemplate size={18} />,
                  ariaLabel: "Profile in center",
                },
                {
                  value: "right",
                  label: <PanelRight size={18} />,
                  ariaLabel: "Profile on right",
                },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
});

ToolbarPalette.displayName = "ToolbarPalette";
