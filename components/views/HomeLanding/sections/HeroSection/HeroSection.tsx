import Link from "next/link";
import { Apple } from "lucide-react";
import layoutStyles from "../../LandingLayout.module.css";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-title">
      <div className={layoutStyles.container}>
        <div className={styles.content}>
          
          {/* Brand Pill */}
          <div className={styles.brandRow}>
            <div className={styles.brandLogo} /> {/* Placeholder for logo icon */}
            <span className={styles.brandName}>PageCraft</span>
          </div>

          {/* Main Headline */}
          <h1 id="home-hero-title" className={styles.title}>
            Experience liftoff with the<br />
            next-generation page builder
          </h1>

          {/* Buttons */}
          <div className={styles.actions}>
            <Link className={styles.primaryButton} href="/auth">
              <Apple size={20} fill="currentColor" />
              <span>Download for MacOS</span>
            </Link>
            
            <Link className={styles.secondaryButton} href="#use-cases">
              Explore use cases
            </Link>
          </div>

        </div>
      </div>
      
      {/* Background Particles (CSS only for now) */}
      <div className={styles.particles} aria-hidden="true" />
    </section>
  );
}
