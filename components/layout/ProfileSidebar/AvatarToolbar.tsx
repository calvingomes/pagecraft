"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Toolbar from "@radix-ui/react-toolbar";
import { Circle, Square, Trash2, Upload } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import styles from "./AvatarToolbar.module.css";
import type { AvatarToolbarProps } from "./ProfileSidebar.types";

const ALLOWED_INPUT_TYPES = new Set(["image/jpeg", "image/png"]);

export function AvatarToolbar({
  visible,
  currentShape,
  onDelete,
  onShapeChange,
  onUpload,
  className,
}: AvatarToolbarProps) {
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
        onTouchStart={(e) => e.stopPropagation()}
        aria-label="Avatar controls"
      >
        <ToggleGroup.Root
          type="single"
          className={styles.group}
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

        <div className={styles.divider} />

        <Toolbar.Button
          type="button"
          title="Delete image"
          aria-label="Delete image"
          onClick={onDelete}
          className={styles.deleteButton}
        >
          <Trash2 size={18} />
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
