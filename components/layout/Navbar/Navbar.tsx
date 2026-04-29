"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { DesktopNav } from "./nav/DesktopNav";
import { MobileNav } from "./nav/MobileNav";
import type { NavLink, NavCTA } from "@/types/nav";
import styles from "./Navbar.module.css";

interface NavbarProps {
  links?: NavLink[];
  cta?: NavCTA;
  secondaryCTA?: NavCTA;
  transparentOnMobile?: boolean;
  logoColor?: string;
  textColor?: string;
  disableMobileMenuTrigger?: boolean;
}

const Navbar = ({
  links = [],
  cta,
  secondaryCTA,
  transparentOnMobile = false,
  logoColor,
  textColor,
  disableMobileMenuTrigger = false,
}: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparentMobile = transparentOnMobile;

  return (
    <header
      className={`${styles.navWrapper} ${isScrolled ? styles.scrolled : ""} ${isTransparentMobile ? styles.transparentOnMobile : ""}`}
    >
      <Image
        src="/svg/corner.svg"
        alt=""
        width={20}
        height={20}
        loading="eager"
        className={`${styles.cornerSvg} ${styles.cornerSvgLeft}`}
      />
      <nav className={styles.nav}>
        <div className={styles.desktopOnly}>
          <DesktopNav links={links} cta={cta} logoColor={logoColor} textColor={textColor} />
        </div>
        <div className={styles.mobileOnly}>
          <MobileNav
            isScrolled={isScrolled}
            isTransparentMobile={isTransparentMobile}
            links={links}
            cta={cta}
            secondaryCTA={secondaryCTA}
            logoColor={logoColor}
            textColor={textColor}
            disableMenuTrigger={disableMobileMenuTrigger}
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
