import Link from "next/link";
import styles from "./LinksSection.module.css";

type HomeLink = {
  title: string;
  description: string;
  href: string;
};

const LINKS: HomeLink[] = [
  {
    title: "Products",
    description: "Blocks, layouts, and a simple editor.",
    href: "#products",
  },
  {
    title: "Customers",
    description: "Made for creators, founders, and teams.",
    href: "#customers",
  },
  {
    title: "See demo",
    description: "Preview how a page looks on mobile.",
    href: "#demo",
  },
  {
    title: "Claim your page",
    description: "Pick a username and publish in minutes.",
    href: "/claim",
  },
];

export function LinksSection() {
  return (
    <section className={styles.section} aria-label="Quick links">
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>Start here</h2>
          <p className={styles.subtitle}>
            A homepage that behaves like a link page.
          </p>
        </div>

        <div className={styles.grid}>
          {LINKS.map((link) => (
            <Link key={link.title} href={link.href} className={styles.card}>
              <div className={styles.cardTitle}>{link.title}</div>
              <div className={styles.cardDesc}>{link.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
