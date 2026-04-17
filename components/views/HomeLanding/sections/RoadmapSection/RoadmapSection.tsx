import styles from "./RoadmapSection.module.css";

const AVAILABLE_ITEMS = [
  "Block-based canvas editor",
  "Drag and drop layout",
  "Dual viewport editing",
  "Mobile-friendly editor",
  "Responsive published pages",
];

const COMING_SOON_ITEMS = [
  "Page analytics",
  "More block types",
  "SEO settings",
  "Custom domains",
];

export function RoadmapSection() {
  return (
    <section className={styles.section} aria-labelledby="roadmap-title">
      <div className="container">
        <header className={styles.header}>
          <h2 id="roadmap-title" className={styles.title}>
            Built for craft
          </h2>
          <p className={styles.subtitle}>
            Here&apos;s what you&apos;re working with, and what&apos;s on the
            way.
          </p>
        </header>

        <div className={styles.grid}>
          {/* Available Now */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Available Now</h3>
            <ul className={styles.list}>
              {AVAILABLE_ITEMS.map((item) => (
                <li key={item} className={styles.item}>
                  <span className={styles.dot} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Coming Soon */}
          <div className={`${styles.column} ${styles.comingSoon}`}>
            <h3 className={styles.columnTitle}>Coming Soon</h3>
            <ul className={styles.list}>
              {COMING_SOON_ITEMS.map((item) => (
                <li key={item} className={styles.item}>
                  <span className={styles.dot} aria-hidden="true" />
                  {item}
                  <span className={styles.badge}>Soon</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
