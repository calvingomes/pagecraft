"use client";

import Link from "next/link";
import styles from "./Navbar.module.css";

const LEFT_ITEMS = [
  { label: "Products - dmy", href: "/nothing1" },
  { label: "Customers - dmy", href: "/nothing2" },
  { label: "Careers - dmy", href: "/nothing3" },
];

const Navbar = () => {
  return (
    <header className={styles.wrapper}>
      <nav className={styles.nav}>
        <div className={styles.left}>
          {LEFT_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={styles.link}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className={styles.logo}>PageCraft</div>

        <div className={styles.right}>
          <Link href="/signin" className={styles.link}>
            Sign in
          </Link>
          <Link href="/demo" className={styles.cta}>
            See a demo →
          </Link>
        </div>
      </nav>
    </header>
  );
};

export { Navbar };
