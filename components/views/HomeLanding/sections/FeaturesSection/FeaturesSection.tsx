import styles from "./FeaturesSection.module.css";
import { FeatureCard } from "./FeatureCard";
import type { FeatureItem } from "./FeaturesSection.types";

const CARD_STICKY_BASE = 160;
const CARD_STICKY_STEP = 20;
const CARD_SCALES = [0.93, 0.96, 1];

const FEATURES: FeatureItem[] = [
  {
    id: "personal-page",
    title: "Your link, your brand",
    description:
      "One link to share your work, social profiles, and anything else that matters. Fully yours.",
    mediaType: "image",
    mediaSrc: "",
    mediaAlt: "Personal page preview",
  },
  {
    id: "drag-drop",
    title: "Drag, drop, done",
    description:
      "Build your page with a visual grid editor. No code. No templates forcing your hand.",
    mediaType: "image",
    mediaSrc: "",
    mediaAlt: "Drag and drop editor",
  },
  {
    id: "mobile-desktop",
    title: "Looks great everywhere",
    description:
      "Edit your desktop and mobile layouts independently. Your page adapts to every screen.",
    mediaType: "image",
    mediaSrc: "",
    mediaAlt: "Responsive layout preview",
  },
];

export function FeaturesSection() {
  return (
    <section className={styles.section} aria-label="Features">
      <div className={styles.container}>
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
