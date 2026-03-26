import React from "react";
import { ClaimInput } from "@/components/ui/ClaimInput/ClaimInput";
import layoutStyles from "../../LandingLayout.module.css";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-title">
      <div className={layoutStyles.container}>
        <div className={styles.content}>
          <h1 id="home-hero-title" className={styles.title}>
            Personal Page<br />
            For The Modern Creatives
          </h1>
          <p className={styles.subtitle}>
            Share who you are and attract more clients
          </p>
          <div className={styles.actionContainer}>
            <ClaimInput />
          </div>
        </div>
      </div>
    </section>
  );
}
