/* eslint-disable css-modules/no-unused-class */
"use client";

import * as RadioGroup from "@radix-ui/react-radio-group";
import { LayoutTemplate, PanelLeft, PanelRight } from "lucide-react";
import styles from "./Toolbar.module.css";
import type {
  PageBackgroundOption,
  ToolbarPalatteProps,
} from "./Toolbar.types";

const PAGE_BG_OPTIONS: PageBackgroundOption[] = [
  { id: "page-bg-1", cssVar: "var(--color-editor-page-bg-1)" },
  { id: "page-bg-2", cssVar: "var(--color-editor-page-bg-2)" },
  { id: "page-bg-3", cssVar: "var(--color-editor-page-bg-3)" },
  { id: "page-bg-4", cssVar: "var(--color-editor-page-bg-4)" },
  { id: "page-bg-5", cssVar: "var(--color-editor-page-bg-5)" },
  { id: "page-bg-6", cssVar: "var(--color-editor-page-bg-6)" },
];

export const ToolbarPalatte = ({
  onChangeBackground,
  onChangeSidebarPosition,
  background = "page-bg-1",
  sidebarPosition = "left",
  showSidebarPositionControls = true,
}: ToolbarPalatteProps) => {
  return (
    <div className={styles.palettePopover}>
      <div className={styles.paletteSection}>
        <span className={styles.paletteLabel}>Background</span>
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
              style={{ background: option.cssVar }}
              value={option.id}
              aria-label={`Background ${option.id}`}
            />
          ))}
        </RadioGroup.Root>
      </div>
      {showSidebarPositionControls && (
        <>
          <div className={styles.paletteDivider} />
          <div className={styles.paletteSection}>
            <span className={styles.paletteLabel}>Profile position</span>
            <RadioGroup.Root
              className={styles.sidebarPositionGroup}
              value={sidebarPosition}
              onValueChange={(next) =>
                onChangeSidebarPosition?.(next as "left" | "center" | "right")
              }
              aria-label="Profile position"
            >
              <RadioGroup.Item
                className={`${styles.sidebarPositionBtn} ${
                  sidebarPosition === "left"
                    ? styles.sidebarPositionSelected
                    : ""
                }`}
                value="left"
                title="Profile on left"
                aria-label="Profile on left"
              >
                <PanelLeft size={18} />
              </RadioGroup.Item>
              <RadioGroup.Item
                className={`${styles.sidebarPositionBtn} ${
                  sidebarPosition === "center"
                    ? styles.sidebarPositionSelected
                    : ""
                }`}
                value="center"
                title="Profile in center"
                aria-label="Profile in center"
              >
                <LayoutTemplate size={18} />
              </RadioGroup.Item>
              <RadioGroup.Item
                className={`${styles.sidebarPositionBtn} ${
                  sidebarPosition === "right"
                    ? styles.sidebarPositionSelected
                    : ""
                }`}
                value="right"
                title="Profile on right"
                aria-label="Profile on right"
              >
                <PanelRight size={18} />
              </RadioGroup.Item>
            </RadioGroup.Root>
          </div>
        </>
      )}
    </div>
  );
};
