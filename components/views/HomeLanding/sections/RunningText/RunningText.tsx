"use client";

import { useRef } from "react";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import styles from "./RunningText.module.css";

const TEXT =
  "PageCraft gives you a canvas to drag, drop, and arrange blocks into a page that actually looks and feels like you. No templates, no grids you can't escape. Build it exactly how you want, publish, and share one link that's entirely yours.";

const words = TEXT.split(" ");

export function RunningText() {
  const sectionRef = useRef<HTMLElement>(null);

  // Use custom hook for scroll progress (0-1)
  const progress = useScrollProgress(sectionRef, 1, 0.5);

  // Derive litCount from progress (minimum 1)
  const litCount = Math.max(1, Math.round(progress * words.length));

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className="container">
        <p className={styles.text}>
          {words.map((word, i) => (
            <span
              key={i}
              className={`${styles.word} ${i < litCount ? styles.lit : ""}`}
            >
              {word}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
