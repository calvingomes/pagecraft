"use client";

import { Trash2 } from "lucide-react";
import styles from "./DeleteButtonCorner.module.css";

interface DeleteButtonCornerProps {
  onClick: () => void;
  title?: string;
  ariaLabel?: string;
  className?: string;
  iconSize?: number;
}

export function DeleteButtonCorner({
  onClick,
  title = "Delete block",
  ariaLabel = "Delete block",
  className = "",
  iconSize = 16,
}: DeleteButtonCornerProps) {
  return (
    <button
      type="button"
      className={`${styles.deleteButton} ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      aria-label={ariaLabel}
    >
      <Trash2 size={iconSize} />
    </button>
  );
}
