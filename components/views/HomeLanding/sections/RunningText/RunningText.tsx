"use client";

import { useRef } from "react";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import styles from "./RunningText.module.css";

const TEXT =
  "Build your page. One link that puts everything in one place — your work, your socials, your story. Drag blocks, pick a layout, and publish in minutes. Build your page. One link that puts everything in one place — your work, your socials, your story. Drag blocks, pick a layout, and publish in minutes.";

const words = TEXT.split(" ");

export function RunningText() {
  const sectionRef = useRef<HTMLElement>(null);

  // Use custom hook for scroll progress (0-1)
  const progress = useScrollProgress(sectionRef, 0.9, 0.3);

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
