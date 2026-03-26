import styles from "./FeaturesSection.module.css";
import type { FeatureItem } from "./FeaturesSection.types";

const CARD_STICKY_BASE = 120;
const CARD_STICKY_STEP = 20;
const CARD_COLORS = [
  "var(--color-landing-card-1)",
  "var(--color-landing-card-2)",
  "var(--color-landing-card-3)",
];

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
          <div
            key={feature.id}
            className={styles.card}
            style={{
              top: CARD_STICKY_BASE + index * CARD_STICKY_STEP,
              zIndex: index + 1,
              backgroundColor: CARD_COLORS[index],
            }}
          >
            <div className={styles.textContent}>
              <h2 className={styles.title}>{feature.title}</h2>
              <p className={styles.description}>{feature.description}</p>
            </div>

            <div className={styles.media}>
              {feature.mediaSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={feature.mediaSrc}
                  alt={feature.mediaAlt}
                  className={styles.mediaImage}
                />
              ) : (
                <span>{feature.mediaAlt}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
