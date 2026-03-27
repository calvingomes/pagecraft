"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Navbar.module.css";


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
        <div className={styles.navSpacer} />

        <Link href="/home" className={styles.navLogo}>
          PageCraft
        </Link>

        {/* <div className={styles.navItemsRight}>
            <ThemeButton
              label="Sign in"
              cta="/auth"
              icon={ArrowRight}
              bgColor="#31a42bff"
              iconCircle={false}
            />
        </div> */}
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
