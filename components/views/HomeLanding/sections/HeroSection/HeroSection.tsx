import Link from "next/link";
import layoutStyles from "../../LandingLayout.module.css";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-title">
      <div className={layoutStyles.container}>
        <div className={styles.card}>
          <div className={styles.copy}>
            <div className={styles.badgeRow}>
              <div className={styles.badge}>PageCraft</div>
              <div className={styles.badgeMuted}>Single-page profiles</div>
            </div>

            <h1 id="home-hero-title" className={`${layoutStyles.title} ${styles.title}`}>
              A link page that feels like a product website.
            </h1>
            <p className={`${layoutStyles.subtitle} ${styles.subtitle}`}>
              Publish a clean, mobile-ready profile with blocks, links, and
              images—then share it everywhere.
            </p>

            <div className={styles.actions}>
              <Link className={layoutStyles.primaryCta} href="/claim">
                Claim your page
              </Link>
              <Link className={layoutStyles.secondaryCta} href="#demo">
                See demo
              </Link>
            </div>
          </div>

          <div className={styles.preview} aria-hidden="true">
            <div className={styles.previewHeader}>
              <div className={styles.avatar}>
                <span className={styles.avatarText}>PC</span>
              </div>
              <div className={styles.previewMeta}>
                <div className={styles.previewName}>Your Name</div>
                <div className={styles.previewBio}>
                  Short bio line that feels professional.
                </div>
              </div>
            </div>
            <div className={styles.previewLinks}>
              <div className={styles.previewLink} />
              <div className={styles.previewLink} />
              <div className={styles.previewLink} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
