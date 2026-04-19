"use client";

import { Navbar } from "@/components/layout/Navbar/Navbar";
import { BottomBar } from "@/components/layout/Footer/BottomBar";
import styles from "./page.module.css";

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.pageWrapper}>
      <Navbar
        cta={{ label: "Get PageCraft free", href: "/auth?mode=signup" }}
        links={[{ label: "Login", href: "/auth?mode=signin" }]}
      />

      <main className={styles.main}>
        <div className={`container ${styles.content}`}>
          <h1 className={styles.title}>Privacy Policy</h1>

          <section className={styles.section}>
            <p className={styles.text}>
              Effective date: 7 April 2026
            </p>
            <p className={styles.text}>
              We built PageCraft to help people publish pages that feel like them. Part of that promise is being straightforward about data. So here it is — plain and simple.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>What we collect</h2>
            <p className={styles.text}>
              When you sign in via Google, GitHub, or Figma, we receive your name and email address — nothing else. We do not receive your password or any other data from those providers.
            </p>
            <p className={styles.text}>
              We also collect the content you create: your blocks, links, and page settings. That is what makes your page work.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>What we do not collect</h2>
            <ul className={styles.list}>
              <li className={styles.listItem}>We do not track you across other websites.</li>
              <li className={styles.listItem}>We do not sell your data. Ever.</li>
              <li className={styles.listItem}>We do not run Google Analytics or any cookie-based analytics.</li>
            </ul>
            <p className={styles.text}>
              For platform analytics, we use Vercel Analytics — a privacy-first tool that is cookieless and collects no personally identifiable information. It tells us things like how many people visited the site, not who they are.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Your page analytics</h2>
            <p className={styles.text}>
              If your plan includes page analytics, you will be able to see how many people visited your page and which links they clicked. This data is private to you — other users cannot see it, and we do not use it for our own purposes.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Who we share data with</h2>
            <p className={styles.text}>
              We work with a small number of trusted services to run PageCraft:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Vercel</strong> — hosts the platform and provides anonymous analytics.</li>
              <li className={styles.listItem}><strong>Supabase</strong> — stores your account data and content securely.</li>
              <li className={styles.listItem}><strong>Payment processor</strong> — handles billing if you are on a paid plan. We never see or store your card details.</li>
            </ul>
            <p className={styles.text}>
              That is it. No data brokers, no ad networks, no surprises.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>How long we keep your data</h2>
            <p className={styles.text}>
              We keep your data for as long as your account is active. If you delete your account, we will remove your personal data within 30 days. Some records may be retained longer where required by law.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Your rights</h2>
            <p className={styles.text}>
              You have the right to access, correct, export, or delete your data at any time. If you are in the EEA, UK, or California, you also have additional rights under GDPR and CCPA respectively — including the right to object to processing and the right to know exactly what data we hold.
            </p>
            <p className={styles.text}>
              To exercise any of these rights, just email us at <a href="mailto:support@pagecraft.me" className={styles.link}>support@pagecraft.me</a>. We will respond within 30 days.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Security</h2>
            <p className={styles.text}>
              We use industry-standard measures to keep your data safe. That said, no system is completely foolproof — if you ever notice something suspicious, please let us know immediately.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Children</h2>
            <p className={styles.text}>
              PageCraft is not intended for children under 13. If you believe a child has created an account, contact us and we will delete it promptly.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Changes</h2>
            <p className={styles.text}>
              If we make any meaningful changes to this policy, we will let you know via email or a notice on the platform before they take effect.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Questions</h2>
            <p className={styles.text}>
              Anything unclear? Email us at <a href="mailto:support@pagecraft.me" className={styles.link}>support@pagecraft.me</a> — we are happy to explain anything in plain language.
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
