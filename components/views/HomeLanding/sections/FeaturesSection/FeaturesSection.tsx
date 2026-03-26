import Image from "next/image";
import layoutStyles from "../../LandingLayout.module.css";
import styles from "./FeaturesSection.module.css";
import type { FeatureItem } from "./FeaturesSection.types";

// Data for the features
const FEATURES: FeatureItem[] = [
  {
    id: "ai-ide-core",
    title: "An AI IDE Core",
    description: "Google Antigravity's Editor view offers tab autocompletion, natural language code commands, and a configurable, and context-aware configurable agent.",
    mediaType: "image",
    mediaSrc: "/images/features/ai-ide-core.png", // Placeholder path
    mediaAlt: "AI IDE Core Interface showing code autocompletion"
  },
  {
    id: "cross-surface-agents",
    title: "Cross-surface Agents",
    description: "Synchronized agentic control across your editor, terminal, and browser for powerful development workflows.",
    mediaType: "image",
    mediaSrc: "/images/features/cross-surface-agents.png", // Placeholder path
    mediaAlt: "Agent interface showing cross-surface capabilities"
  },
  {
    id: "user-feedback",
    title: "User Feedback",
    description: "Intuitively integrate feedback across surfaces and artifacts to guide and refine the agent's work.",
    mediaType: "image",
    mediaSrc: "/images/features/user-feedback.png", // Placeholder path
    mediaAlt: "User feedback interface showing refinement options"
  }
];

export function FeaturesSection() {
  return (
    <section className={styles.section} aria-label="Key Features">
      <div className={layoutStyles.container}>
        {FEATURES.map((feature, index) => (
          <div 
            key={feature.id} 
            className={`${styles.featureRow} ${index % 2 !== 0 ? styles.reversed : ''}`}
          >
            {/* Text Content */}
            <div className={styles.textContent}>
              <h2 className={styles.title}>{feature.title}</h2>
              <p className={styles.description}>{feature.description}</p>
            </div>

            {/* Media Content */}
            <div className={styles.mediaContainer}>
              {feature.mediaType === "video" ? (
                <video 
                  src={feature.mediaSrc} 
                  className={styles.mediaAsset}
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  aria-label={feature.mediaAlt}
                />
              ) : (
                /* Using a simple div placeholder if image fails to load, or Next/Image */
                <div style={{ width: '100%', height: '100%', background: '#F0F4F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8899A6' }}>
                   {/* In a real app, use <Image /> here. For now, text placeholder to prevent broken image icons */}
                   <span>{feature.mediaAlt} Placeholder</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
