import styles from "./FeatureCard.module.css";
import type { FeatureCardProps } from "./FeaturesSection.types";
import type { CSSProperties } from "react";

export function FeatureCard({
  feature,
  index,
  stickyTop,
  scale,
}: FeatureCardProps) {
  const cardStyle: CSSProperties = {
    top: stickyTop,
    zIndex: index + 1,
    transform: `scale(${scale})`,
  };

  return (
    <div className={styles.card} style={cardStyle}>
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
  );
}
