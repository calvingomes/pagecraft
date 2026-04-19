"use client";

import { Navbar } from "@/components/layout/Navbar/Navbar";
import { BottomBar } from "@/components/layout/Footer/BottomBar";
import styles from "./page.module.css";

export default function CookiePolicyPage() {
  return (
    <div className={styles.pageWrapper}>
      <Navbar
        cta={{ label: "Get PageCraft free", href: "/auth?mode=signup" }}
        links={[{ label: "Login", href: "/auth?mode=signin" }]}
      />

      <main className={styles.main}>
        <div className={`container ${styles.content}`}>
          <h1 className={styles.title}>Cookie Policy</h1>

          <section className={styles.section}>
            <p className={styles.text}>
              Effective date: 7 April 2026
            </p>
            <p className={styles.text}>
              Cookies are small text files stored on your device by a website. Here is exactly what PageCraft does — and does not — use.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>What we use</h2>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Session cookie</strong>: Keeps you logged in while you use the app. It is deleted when you log out or close your browser.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>What we do not use</h2>
            <ul className={styles.list}>
              <li className={styles.listItem}>No advertising or tracking cookies.</li>
              <li className={styles.listItem}>No third-party analytics cookies. We use Vercel Analytics, which is cookieless and collects no personally identifiable information.</li>
              <li className={styles.listItem}>No retargeting or social media pixels.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Third-party sign-in</h2>
            <p className={styles.text}>
              If you sign in via Google, GitHub, or Figma, those providers may set their own cookies as part of the authentication flow. We have no control over these — refer to their respective cookie policies.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Managing cookies</h2>
            <p className={styles.text}>
              You can clear or block cookies through your browser settings. Blocking the session cookie will prevent you from staying logged in.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Questions</h2>
            <p className={styles.text}>
              Contact us at <a href="mailto:support@pagecraft.me" className={styles.link}>support@pagecraft.me</a>
            </p>
          </section>
        </div>
      </main>

      {/* Simplified Footer - Bottom Bar Only */}
      <footer className="container">
        <BottomBar className={styles.footerBottom} />
      </footer>
    </div>
  );
}
