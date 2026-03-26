"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import styles from "./Navbar.module.css";
import { ThemeButton } from "@/components/ui/ThemeButton/ThemeButton";

const LEFT_ITEMS = [
  { label: "Products", href: "#products" },
  { label: "Customers", href: "#customers" },
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
            <ThemeButton
              key={item.href}
              label={item.label}
              cta={item.href}
              bgColor="transparent"
              textColor="#0e220e"
            />
          ))}
        </div>

        <Link href="/home" className={styles.navLogo}>
          PageCraft
        </Link>

        <div className={styles.navItemsRight}>
          {/* <ThemeButton
            label="Sign in"
            cta="/auth"
            bgColor="transparent"
            textColor="#0e220e"
          /> */}
          <ThemeButton
            label="Sign in"
            cta="/claim"
            icon={ArrowRight}
            bgColor="#31a42bff"
            iconCircle={false}
          />
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
