"use client";

import styles from "./WordCount.module.css";

export type WordCountMode = "words" | "characters";

export type WordCountProps = {
  value: string;
  max?: number;
  mode?: WordCountMode;
  className?: string;
  ariaLabel?: string;
};

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function countCharacters(text: string): number {
  return Array.from(text).length;
}

export function WordCount({
  value,
  max,
  mode = "words",
  className,
  ariaLabel,
}: WordCountProps) {
  const count =
    mode === "characters" ? countCharacters(value) : countWords(value);

  return (
    <div
      className={`${styles.wordCount}${className ? ` ${className}` : ""}`}
      aria-label={
        ariaLabel ?? (mode === "characters" ? "Character count" : "Word count")
      }
      aria-live="polite"
    >
      {typeof max === "number" ? `${count}/${max}` : String(count)}
    </div>
  );
}
