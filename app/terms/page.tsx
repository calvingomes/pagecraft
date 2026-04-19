"use client";

import { Navbar } from "@/components/layout/Navbar/Navbar";
import { BottomBar } from "@/components/layout/Footer/BottomBar";
import styles from "./page.module.css";

export default function TermsPage() {
  return (
    <div className={styles.pageWrapper}>
      <Navbar
        cta={{ label: "Get PageCraft free", href: "/auth?mode=signup" }}
        links={[
          { label: "How it works", href: "/#how-it-works" },
          { label: "Features", href: "/#features" },
          { label: "Login", href: "/auth?mode=signin" },
        ]}
      />

      <main className={styles.main}>
        <div className={`container ${styles.content}`}>
          <h1 className={styles.title}>Terms and Conditions</h1>

          <section className={styles.section}>
            <p className={styles.text}>Effective date: 7 April 2026</p>
            <p className={styles.text}>
              These Terms govern your use of PageCraft, including our website at
              pagecraft.me and all related services. By creating an account or
              using the Service, you agree to these Terms.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Eligibility</h2>
            <p className={styles.text}>
              You must be at least 13 years old to use PageCraft. If you are
              under 18, you must have permission from a parent or legal
              guardian.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Your account</h2>
            <p className={styles.text}>
              You may register using Google, GitHub, or Figma. You are
              responsible for all activity that occurs under your account.
              Notify us immediately at{" "}
              <a href="mailto:support@pagecraft.me" className={styles.link}>
                support@pagecraft.me
              </a>{" "}
              if you suspect unauthorised access.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Acceptable use</h2>
            <p className={styles.text}>You agree not to use PageCraft to:</p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                Post content that is unlawful, harmful, defamatory, or obscene.
              </li>
              <li className={styles.listItem}>
                Impersonate any person or misrepresent your identity.
              </li>
              <li className={styles.listItem}>
                Distribute spam, malware, or phishing content via your page.
              </li>
              <li className={styles.listItem}>
                Attempt to circumvent any security measures of the Service.
              </li>
              <li className={styles.listItem}>
                Scrape or extract data from the Service without prior written
                permission.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Your content</h2>
            <p className={styles.text}>
              You own the content you create on PageCraft. By publishing it, you
              grant us a non-exclusive, royalty-free licence to host and deliver
              it as part of operating the Service. We do not sell or share your
              content with third parties for their own commercial purposes.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Intellectual property</h2>
            <p className={styles.text}>
              The PageCraft name, logo, and platform are our intellectual
              property. You may not copy, reproduce, or distribute any part of
              the Service without our prior written consent.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Paid plans and billing</h2>
            <p className={styles.text}>
              Paid plans are billed on a recurring basis. Subscriptions renew
              automatically unless cancelled before the renewal date. We do not
              store your payment card details — this is handled by our payment
              processor.
            </p>
            <p className={styles.text}>
              We may update pricing with reasonable notice. Continued use after
              a price change constitutes acceptance of the new pricing. Refunds
              are issued at our discretion and in line with applicable consumer
              protection laws.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Analytics</h2>
            <p className={styles.text}>
              We use Vercel Analytics for anonymous, aggregated platform
              analytics. Users on eligible plans can view their own page
              analytics — visit counts and link clicks. This data is private to
              each user.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Disclaimer</h2>
            <p className={styles.text}>
              The Service is provided &quot;as is&quot; without warranties of
              any kind. We do not guarantee the Service will be uninterrupted or
              error-free.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>9. Limitation of liability</h2>
            <p className={styles.text}>
              PageCraft is not liable for any indirect, incidental, or
              consequential damages arising from your use of the Service.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>10. Termination</h2>
            <p className={styles.text}>
              You may delete your account at any time. We may suspend or
              terminate access for violations of these Terms. Upon termination,
              your Published Pages will be taken offline and your data handled
              per our Privacy Policy.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>11. Changes to these Terms</h2>
            <p className={styles.text}>
              We may update these Terms from time to time. We will notify you of
              material changes via email or a notice on the platform. Continued
              use after notice constitutes acceptance.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>12. Contact</h2>
            <p className={styles.text}>
              Questions about these Terms? Email us at{" "}
              <a href="mailto:support@pagecraft.me" className={styles.link}>
                support@pagecraft.me
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className="container">
        <BottomBar className={styles.footerBottom} />
      </footer>
    </div>
  );
}
