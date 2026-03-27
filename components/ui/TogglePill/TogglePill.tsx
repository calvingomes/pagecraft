"use client";

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
    const activeIndex = options.findIndex((o) => o.value === value);
    const btns = pill.querySelectorAll<HTMLButtonElement>("button");
    const activeBtn = btns[activeIndex];
    if (!activeBtn) return;
    setThumb({
      left: activeBtn.offsetLeft,
      width: activeBtn.offsetWidth,
      height: activeBtn.offsetHeight,
    });
  }, [value, options]);

  return (
    <div
      ref={pillRef}
      className={`${styles.pill} ${variant === "dark" ? styles.pillDark : ""}`}
    >
      <span
        className={styles.thumb}
        style={{ left: thumb.left, width: thumb.width, height: thumb.height }}
        aria-hidden
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${styles.btn} ${value === option.value ? styles.btnActive : ""}`}
          onClick={() => onChange(option.value)}
          aria-label={option.ariaLabel}
          title={option.ariaLabel}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
