import styles from "./HomeLanding.module.css";
import { HeroSection } from "./sections/HeroSection/HeroSection";
import { InfoSection } from "./sections/InfoSection/InfoSection";
import { LinksSection } from "./sections/LinksSection/LinksSection";
import { DemoSection } from "./sections/DemoSection/DemoSection";
import { Footer } from "./sections/Footer/Footer";

export function HomeLanding() {
  return (
    <main className={styles.main}>
      <HeroSection />
      <LinksSection />
      <InfoSection />
      <DemoSection />
      <Footer />
    </main>
  );
}
