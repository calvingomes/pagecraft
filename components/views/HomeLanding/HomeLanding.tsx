import styles from "./HomeLanding.module.css";
import { HeroSection } from "./sections/HeroSection/HeroSection";
import { VideoSection } from "./sections/VideoSection/VideoSection";
import { RunningText } from "./sections/RunningText/RunningText";
import { FeaturesSection } from "./sections/FeaturesSection/FeaturesSection";
import { Footer } from "./sections/Footer/Footer";

export function HomeLanding() {
  return (
    <main className={styles.main}>
      <HeroSection />
      <VideoSection />
      <RunningText />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
