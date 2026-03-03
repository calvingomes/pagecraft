"use client";

import { Circle, Square, Trash2, Upload } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import toolbarStyles from "@/components/builder/BlockHoverToolbar/BlockHoverToolbar.module.css";
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
      <div
        className={`${toolbarStyles.toolbar} ${visible ? toolbarStyles.toolbarVisible : ""} ${className ?? ""}`}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          title="Circle"
          aria-label="Circle"
          onClick={() => onShapeChange("circle")}
          className={`${toolbarStyles.sizeButton} ${currentShape === "circle" ? toolbarStyles.active : ""}`}
        >
          <Circle size={16} className={toolbarStyles.sizeIcon} />
        </button>

        <button
          type="button"
          title="Square"
          aria-label="Square"
          onClick={() => onShapeChange("square")}
          className={`${toolbarStyles.sizeButton} ${currentShape === "square" ? toolbarStyles.active : ""}`}
        >
          <Square size={16} className={toolbarStyles.sizeIcon} />
        </button>

        <button
          type="button"
          title="Upload"
          aria-label="Upload"
          onClick={handlePickFile}
          className={toolbarStyles.sizeButton}
        >
          <Upload size={16} className={toolbarStyles.sizeIcon} />
        </button>

        <div className={toolbarStyles.divider} />

        <button
          type="button"
          title="Delete image"
          aria-label="Delete image"
          onClick={onDelete}
          className={toolbarStyles.deleteButton}
        >
          <Trash2 size={18} className={toolbarStyles.sizeIcon} />
        </button>
      </div>

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
