"use client";

import { useRef, useState, useEffect } from "react";
import styles from "./RunningText.module.css";

const TEXT =
  "Build your page. One link that puts everything in one place — your work, your socials, your story. Drag blocks, pick a layout, and publish in minutes.";

const words = TEXT.split(" ");

export function RunningText() {
  const sectionRef = useRef<HTMLElement>(null);
  const [litCount, setLitCount] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;

      const { top, height } = el.getBoundingClientRect();
      const sectionCenter = top + height / 2;

      const animStart = window.innerHeight * 0.9;
      const animEnd = window.innerHeight * 0.5;

      const progress = Math.min(
        1,
        Math.max(0, (animStart - sectionCenter) / (animStart - animEnd))
      );

      // Ensure first word always stays lit (minimum 1)
      setLitCount(Math.max(1, Math.round(progress * words.length)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
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
