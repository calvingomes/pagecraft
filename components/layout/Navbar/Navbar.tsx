"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Navbar.module.css";

const LEFT_ITEMS = [
  { label: "Products", href: "#products" },
  { label: "Customers", href: "#customers" },
  { label: "Careers", href: "#careers" },
];

const Navbar = () => {
  return (
    <header className={styles.navWrapper}>
      <Image
        src="/svg/corner.svg"
        alt=""
        width={20}
        height={20}
        loading="eager"
        className={`${styles.cornerSvg} ${styles.cornerSvgLeft}`}
      />
      <nav className={styles.nav}>
        <div className={styles.navItemsLeft}>
          {LEFT_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </div>

        <Link href="/home" className={styles.navLogo}>
          PageCraft
        </Link>

        <div className={styles.navItemsRight}>
          <Link href="/auth" className={styles.navButton}>
            Sign in
          </Link>
          <Link href="/claim" className={styles.navCta}>
            Book a demo
          </Link>
        </div>
      </nav>
      <Image
        src="/svg/corner.svg"
        alt=""
        width={20}
        height={20}
        loading="eager"
        className={`${styles.cornerSvg} ${styles.cornerSvgRight}`}
      />
    </header>
  );
};

export { Navbar };
