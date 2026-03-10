import styles from "./HomeLanding.module.css";
import { HeroSection } from "./sections/HeroSection/HeroSection";
import { FeaturesSection } from "./sections/FeaturesSection/FeaturesSection";
import { Footer } from "./sections/Footer/Footer";

export function HomeLanding() {
  return (
    <main className={styles.main}>
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
