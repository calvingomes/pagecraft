"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Navbar.module.css";

const LEFT_ITEMS = [
  { label: "Products", href: "/nothing1" },
  { label: "Customers", href: "/nothing2" },
  { label: "Careers", href: "/nothing3" },
];

const Navbar = () => {
  return (
    <header className={styles.wrapper}>
      <Image
        src="/svg/corner.svg"
        alt=""
        width={100}
        height={100}
        className={`${styles.corner} ${styles.cornerLeft}`}
      />
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
      <Image
        src="/svg/corner.svg"
        alt=""
        width={100}
        height={100}
        className={`${styles.corner} ${styles.cornerRight}`}
      />
    </header>
  );
};

export { Navbar };
