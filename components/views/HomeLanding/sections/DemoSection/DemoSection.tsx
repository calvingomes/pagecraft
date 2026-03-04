import Link from "next/link";
import layoutStyles from "../../LandingLayout.module.css";
import styles from "./DemoSection.module.css";

export function DemoSection() {
  return (
    <section
      id="demo"
      className={layoutStyles.section}
      aria-labelledby="home-demo-title"
    >
      <div className={layoutStyles.containerNarrow}>
        <div className={styles.panel}>
          <div className={styles.text}>
            <h2 id="home-demo-title" className={styles.title}>
              Designed for mobile first.
            </h2>
            <p className={styles.subtitle}>
              Your page stays readable, tappable, and fast—without feeling like
              a template.
            </p>

            <div className={styles.actions}>
              <Link className={`${layoutStyles.secondaryCta} ${styles.secondaryCta}`} href="/home">
                Refresh preview
              </Link>
              <Link className={`${layoutStyles.primaryCta} ${styles.primaryCta}`} href="/claim">
                Build yours
              </Link>
            </div>
          </div>

          <div className={styles.phone} aria-hidden="true">
            <div className={styles.phoneTop} />
            <div className={styles.phoneCard} />
            <div className={styles.phoneCard} />
            <div className={styles.phoneCard} />
            <div className={styles.phoneBottom} />
          </div>
        </div>
      </div>
    </section>
  );
}
