"use client";

import { useRef } from "react";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import styles from "./VideoSection.module.css";

export function VideoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  
  // Track scroll progress: starts at 120% view depth (well before it appears), ends at 50% (middle of screen)
  const progress = useScrollProgress(sectionRef, 1.2, 0.5);
  
  // Map progress to scale (0.5 -> 1.0)
  const scale = 0.5 + progress * 0.5;

  return (
    <section id="how-it-works" ref={sectionRef} className={styles.videoSection}>
      <div 
        className={styles.container}
        style={{
          transform: `scale(${scale})`,
        }}
      >
        <video
          className={styles.video}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
        >
          <source src="/videos/showcase.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
}
