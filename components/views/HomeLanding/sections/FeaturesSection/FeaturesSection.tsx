import styles from "./FeaturesSection.module.css";
import { FeatureCard } from "./FeatureCard";
import type { FeatureItem } from "./FeaturesSection.types";

const CARD_STICKY_BASE = 160;
const CARD_STICKY_STEP = 20;
const CARD_SCALES = [0.93, 0.96, 1];

const FEATURES: FeatureItem[] = [
  {
    id: "drag-and-drop",
    title: "Your canvas, your rules",
    description:
      "Drag blocks, arrange them however you want, and build a page that's completely yours. No templates, no restrictions.",
    mediaType: "video",
    mediaSrc: "/videos/card-1.mp4",
    mediaAlt: "Drag and drop preview",
  },
  {
    id: "dual-viewport",
    title: "Looks right everywhere",
    description:
      "Edit your desktop and mobile layouts independently. What your visitors see is always exactly what you intended.",
    mediaType: "video",
    mediaSrc: "/videos/card-2.mp4",
    mediaAlt: "Dual viewport preview",
  },
  {
    id: "publish-and-share",
    title: "Live in seconds",
    description:
      "Copy your pagecraft.me link, open a new tab, and it's already there. No save button, no waiting. Just live.",
    mediaType: "video",
    mediaSrc: "/videos/card-3.mp4",
    mediaAlt: "Publish and share preview",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className={styles.section} aria-label="Features">
      <div className="container">
        <div className={styles.stack}>
          {FEATURES.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={index}
              stickyTop={CARD_STICKY_BASE + index * CARD_STICKY_STEP}
              scale={CARD_SCALES[index]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
