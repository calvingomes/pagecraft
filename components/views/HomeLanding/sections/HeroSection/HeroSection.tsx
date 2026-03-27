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
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 id="home-hero-title" className={styles.title}>
            Personal Page<br />
            <span className={styles.titleAccent}>For Creatives</span>
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
