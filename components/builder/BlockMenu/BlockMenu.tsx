"use client";

import type { LucideIcon } from "lucide-react";
import {
  Link2,
  Image as ImageIcon,
  Heading1,
  Minus,
  List,
  Quote,
  Code2,
  SlidersHorizontal,
} from "lucide-react";
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

const BLOCK_OPTIONS: { type: BlockType; Icon: LucideIcon; label: string }[] = [
  { type: "text", Icon: Link2, label: "Link" },
  { type: "image", Icon: ImageIcon, label: "Image" },
  { type: "heading", Icon: Heading1, label: "Heading" },
  { type: "divider", Icon: Minus, label: "Divider" },
  { type: "list", Icon: List, label: "List" },
  { type: "quote", Icon: Quote, label: "Quote" },
  { type: "code", Icon: Code2, label: "Code" },
  { type: "text", Icon: SlidersHorizontal, label: "Controls" },
];

export const BlockMenu = ({ onAddBlock }: BlockMenuProps) => {
  return (
    <div className={styles.blockMenuContainer}>
      <div className={styles.blockMenuContent}>
        {BLOCK_OPTIONS.map(({ type, Icon, label }) => (
          <button
            key={`${type}-${label}`}
            className={styles.blockButton}
            onClick={() => onAddBlock(type)}
            title={label}
            aria-label={label}
          >
            <Icon className={styles.icon} />
          </button>
        ))}
      </div>
    </div>
  );
};
