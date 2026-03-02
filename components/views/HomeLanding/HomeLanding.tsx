import styles from "./HomeLanding.module.css";
import Link from "next/link";

const LOGOS = [
  "Aura",
  "ActiveCampaign",
  "WorkWhile",
  "Intercom",
  "Crypto.com",
  "Podium",
];

export function HomeLanding() {
  return (
    <main className={styles.main}>
      <section className={styles.hero} aria-labelledby="home-hero-title">
        <div className={styles.container}>
          <div className={styles.heroCard}>
            <div className={styles.heroContent}>
              <h1 id="home-hero-title" className={styles.heroTitle}>
                QA and train your human and AI agents
              </h1>
              <p className={styles.heroSubtitle}>
                Make every customer interaction better, faster, and more
                consistent with optimization platform for CX agents.
              </p>

              <form
                className={styles.heroForm}
                action="/claim"
                method="get"
                aria-label="Request a demo"
              >
                <label className={styles.srOnly} htmlFor="hero-email">
                  Email address
                </label>
                <input
                  id="hero-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email address"
                  className={styles.heroInput}
                />
                <button type="submit" className={styles.heroButton}>
                  Book a demo
                </button>
              </form>
            </div>

            <div className={styles.logoRow} aria-label="Customer logos">
              {LOGOS.map((name) => (
                <div key={name} className={styles.logoPill}>
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="products"
        className={styles.section}
        aria-labelledby="home-features-title"
      >
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 id="home-features-title" className={styles.sectionTitle}>
              Close the loop from customer insight to agent improvement
            </h2>
          </div>

          <div className={styles.featureGrid}>
            <article className={styles.featureCard}>
              <div className={styles.featurePreview} aria-hidden="true">
                <div className={styles.previewChip} />
                <div className={styles.previewRow} />
                <div className={styles.previewRow} />
                <div className={styles.previewRowShort} />
              </div>
              <h3 className={styles.featureTitle}>
                Review 100% of interactions in seconds.
              </h3>
              <p className={styles.featureText}>
                Auto QA scores surface what matters across every conversation.
              </p>
              <div className={styles.featureCtas}>
                <Link className={styles.pillButton} href="/claim">
                  Book a demo
                </Link>
                <Link className={styles.ghostButton} href="/auth">
                  See how it works
                </Link>
              </div>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featurePreviewAlt} aria-hidden="true">
                <div className={styles.previewHeading} />
                <div className={styles.previewBullet} />
                <div className={styles.previewBullet} />
                <div className={styles.previewBullet} />
              </div>
              <h3 className={styles.featureTitle}>Generate custom training.</h3>
              <p className={styles.featureText}>
                Turn patterns into action with targeted coaching plans.
              </p>
              <div className={styles.featureCtas}>
                <Link className={styles.pillButton} href="/claim">
                  Book a demo
                </Link>
                <Link className={styles.ghostButton} href="/auth">
                  See how it works
                </Link>
              </div>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featurePreviewGreen} aria-hidden="true">
                <div className={styles.chartTop} />
                <div className={styles.chartBars}>
                  <div className={styles.chartBar} />
                  <div className={styles.chartBarTall} />
                  <div className={styles.chartBarMid} />
                </div>
              </div>
              <h3 className={styles.featureTitle}>
                Watch customer satisfaction increase.
              </h3>
              <p className={styles.featureText}>
                Tie quality signals to performance metrics in one place.
              </p>
              <div className={styles.featureCtas}>
                <Link className={styles.pillButton} href="/claim">
                  Book a demo
                </Link>
                <Link className={styles.ghostButton} href="/auth">
                  See how it works
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.testimonial} aria-label="Customer story">
        <div className={styles.container}>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialArt} aria-hidden="true" />
            <div className={styles.testimonialBody}>
              <div className={styles.testimonialBrand}>crypto.com</div>
              <p className={styles.quote}>
                “We have complete visibility into quality across hundreds of
                thousands of conversations. We can verify agent readiness before
                it impacts customers.”
              </p>
              <div className={styles.quoteMeta}>
                <div className={styles.quoteName}>Aki Kintaro</div>
                <div className={styles.quoteRole}>Head of Training</div>
              </div>

              <div className={styles.stats} aria-label="Key stats">
                <div className={styles.stat}>
                  <div className={styles.statValue}>18%</div>
                  <div className={styles.statLabel}>
                    Reduction in average handle time
                  </div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statValue}>3%</div>
                  <div className={styles.statLabel}>Increase in CSAT score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.collageSection} aria-label="Overview">
        <div className={styles.container}>
          <p className={styles.bigCopy}>
            CX teams use PageCraft to raise the quality bar on every customer
            interaction, unifying human and AI agents in one optimization layer
            that continuously improves performance across all conversations.
          </p>

          <div className={styles.collage} aria-hidden="true">
            <div className={styles.collageTile} />
            <div className={styles.collageTile} />
            <div className={styles.collageTileWide} />
            <div className={styles.collageTile} />
            <div className={styles.collageTile} />
          </div>
        </div>
      </section>

      <section id="customers" className={styles.section} aria-label="Benefits">
        <div className={styles.container}>
          <div className={styles.benefitsGrid}>
            <article className={styles.benefitCard}>
              <div className={styles.benefitArt} aria-hidden="true" />
              <h3 className={styles.benefitTitle}>Built by CX experts</h3>
              <p className={styles.benefitText}>
                A simple workflow that scales from pilot to production.
              </p>
            </article>
            <article className={styles.benefitCard}>
              <div className={styles.benefitArtAlt} aria-hidden="true" />
              <h3 className={styles.benefitTitle}>Made for your CX stack</h3>
              <p className={styles.benefitText}>
                Fits alongside your CRM, helpdesk, and analytics.
              </p>
            </article>
            <article className={styles.benefitCardWide}>
              <div className={styles.benefitWideTop}>
                <h3 className={styles.benefitTitle}>
                  Engineered for enterprises
                </h3>
                <p className={styles.benefitText}>
                  Secure by default with clear controls and permissions.
                </p>
              </div>
              <div className={styles.benefitWideBottom} aria-hidden="true">
                <div className={styles.tagRow}>
                  <div className={styles.tag}>Compliant</div>
                  <div className={styles.tag}>Auditable</div>
                  <div className={styles.tag}>Role-based</div>
                  <div className={styles.tag}>Scalable</div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.cta} aria-labelledby="home-cta-title">
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2 id="home-cta-title" className={styles.ctaTitle}>
              Raise the bar for every customer interaction
            </h2>

            <form
              className={styles.ctaForm}
              action="/claim"
              method="get"
              aria-label="Book a demo"
            >
              <label className={styles.srOnly} htmlFor="cta-email">
                Email address
              </label>
              <input
                id="cta-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                className={styles.ctaInput}
              />
              <button type="submit" className={styles.ctaButton}>
                Book a demo
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className={styles.footer} aria-label="Footer">
        <div className={styles.container}>
          <div id="careers" className={styles.srOnly} />
          <div className={styles.footerTop}>
            <div className={styles.footerMark} aria-hidden="true" />
            <div className={styles.footerCols}>
              <div className={styles.footerCol}>
                <div className={styles.footerHeading}>Product</div>
                <Link href="#products" className={styles.footerLink}>
                  Products
                </Link>
                <Link href="#customers" className={styles.footerLink}>
                  Customers
                </Link>
              </div>
              <div className={styles.footerCol}>
                <div className={styles.footerHeading}>Company</div>
                <Link href="/auth" className={styles.footerLink}>
                  Sign in
                </Link>
                <Link href="/claim" className={styles.footerLink}>
                  Book a demo
                </Link>
              </div>
              <div className={styles.footerCol}>
                <div className={styles.footerHeading}>Legal</div>
                <Link href="/" className={styles.footerLink}>
                  Terms
                </Link>
                <Link href="/" className={styles.footerLink}>
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
