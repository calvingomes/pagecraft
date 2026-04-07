import Image from "next/image";
import { ClaimInput } from "@/components/ui/ClaimInput/ClaimInput";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-title">
      <Image
        src="/svg/hero-arcs.svg"
        alt=""
        fill
        className={styles.arcSvg}
        aria-hidden
      />
      <div className="container">
        <div className={styles.content}>
          <h1 id="home-hero-title" className={styles.title}>
            Craft your corner<br />
            <span className={styles.titleAccent}>of the web.</span>
          </h1>
          <p className={styles.subtitle}>
            Build a page that actually looks like you
          </p>
          <div className={styles.actionContainer}>
            <ClaimInput />
          </div>
        </div>
      </div>
    </section>
  );
}
