/* eslint-disable css-modules/no-unused-class */
"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Toolbar from "@radix-ui/react-toolbar";
import { Circle, Square, Upload } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import styles from "./../HoverToolbar.module.css";
import type { AvatarHoverToolbarProps } from "./AvatarHoverToolbar.types";

const ALLOWED_INPUT_TYPES = new Set(["image/jpeg", "image/png"]);

export function AvatarHoverToolbar({
  visible,
  currentShape,
  onShapeChange,
  onUpload,
  className,
}: AvatarHoverToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_INPUT_TYPES.has(file.type)) {
      event.currentTarget.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        onUpload(result);
      }
    };

    reader.readAsDataURL(file);
    event.currentTarget.value = "";
  };

  return (
    <>
      <Toolbar.Root
        className={`${styles.toolbar} ${visible ? styles.toolbarVisible : ""} ${className ?? ""}`}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Avatar controls"
      >
        <ToggleGroup.Root
          type="single"
          className={styles.shapeGroup}
          value={currentShape}
          onValueChange={(nextValue) => {
            if (nextValue === "circle" || nextValue === "square") {
              onShapeChange(nextValue);
            }
          }}
        >
          <ToggleGroup.Item
            value="circle"
            title="Circle"
            aria-label="Circle"
            className={`${styles.sizeButton} ${currentShape === "circle" ? styles.active : ""}`}
          >
            <Circle size={16} className={styles.sizeIcon} />
          </ToggleGroup.Item>

          <ToggleGroup.Item
            value="square"
            title="Square"
            aria-label="Square"
            className={`${styles.sizeButton} ${currentShape === "square" ? styles.active : ""}`}
          >
            <Square size={16} className={styles.sizeIcon} />
          </ToggleGroup.Item>
        </ToggleGroup.Root>

        <Toolbar.Button
          type="button"
          title="Upload"
          aria-label="Upload"
          onClick={handlePickFile}
          className={styles.sizeButton}
        >
          <Upload size={16} className={styles.sizeIcon} />
        </Toolbar.Button>
      </Toolbar.Root>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleFileChange}
        hidden
      />
    </>
  );
}
