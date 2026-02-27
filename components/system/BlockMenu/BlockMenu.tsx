"use client";

import styles from "./BlockMenu.module.css";

type BlockType =
  | "text"
  | "image"
  | "heading"
  | "divider"
  | "list"
  | "quote"
  | "code";

type BlockMenuProps = {
  onAddBlock: (type: BlockType) => void;
};

const BLOCK_OPTIONS: { type: BlockType; icon: string; label: string }[] = [
  { type: "text", icon: "🔗", label: "Link" },
  { type: "image", icon: "🖼️", label: "Image" },
  { type: "heading", icon: "📝", label: "Heading" },
  { type: "divider", icon: "➖", label: "Divider" },
  { type: "list", icon: "📋", label: "List" },
  { type: "quote", icon: "💬", label: "Quote" },
  { type: "code", icon: "</>", label: "Code" },
  { type: "text", icon: "🎛️", label: "Controls" },
];

export const BlockMenu = ({ onAddBlock }: BlockMenuProps) => {
  return (
    <div className={styles.blockMenuContainer}>
      <div className={styles.blockMenuContent}>
        {BLOCK_OPTIONS.map((option) => (
          <button
            key={`${option.type}-${option.label}`}
            className={styles.blockButton}
            onClick={() => onAddBlock(option.type)}
            title={option.label}
            aria-label={option.label}
          >
            <span className={styles.icon}>{option.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
