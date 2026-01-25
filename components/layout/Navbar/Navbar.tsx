"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Navbar.module.css";

const LEFT_ITEMS = [
  { label: "Products", href: "/nothing1" },
  { label: "Customers", href: "/nothing2" },
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
          <Link href="/nothing3" className={styles.navLink}>
            See demo
          </Link>
          <Link href="/auth" className={styles.navCta}>
            Claim your page
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
