"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useRef, useEffect, useState } from "react";
import type { TogglePillProps } from "./TogglePill.types";
import styles from "./TogglePill.module.css";

export function TogglePill<T extends string>({
  options,
  value,
  onChange,
  variant = "default",
}: TogglePillProps<T> & { variant?: "default" | "dark" }) {
  const pillRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ left: 0, width: 0, height: 0 });

  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;
    const activeBtn =
      pill.querySelector<HTMLButtonElement>('[data-state="on"]');
    if (!activeBtn) return;
    setThumb({
      left: activeBtn.offsetLeft,
      width: activeBtn.offsetWidth,
      height: activeBtn.offsetHeight,
    });
  }, [value, options]);

  return (
    <ToggleGroup.Root
      ref={pillRef}
      type="single"
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) {
          onChange(nextValue as T);
        }
      }}
      className={`${styles.pill} ${variant === "dark" ? styles.pillDark : ""}`}
    >
      <span
        className={styles.thumb}
        style={{ left: thumb.left, width: thumb.width, height: thumb.height }}
        aria-hidden
      />
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          className={`${styles.btn} ${value === option.value ? styles.btnActive : ""}`}
          aria-label={option.ariaLabel}
          title={option.ariaLabel}
        >
          {option.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
