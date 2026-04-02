"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useViewportMode } from "@/hooks/useViewportMode";
import type { PageBackgroundId } from "@/types/page";
import { PAGE_THEMES } from "@/lib/page-theme";
import { deriveTextColor } from "@/lib/utils/colorUtils";
import { DesktopNav } from "./nav/DesktopNav";
import { MobileNav } from "./nav/MobileNav";
import type { NavLink, NavCTA } from "@/types/nav";
import styles from "./Navbar.module.css";

interface NavbarProps {
  background?: PageBackgroundId;
  links?: NavLink[];
  cta?: NavCTA;
  secondaryCTA?: NavCTA;
}

const Navbar = ({
  background,
  links = [],
  cta,
  secondaryCTA,
}: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { viewportMode, isResolved } = useViewportMode();
  const segments = pathname.split("/").filter(Boolean);
  const isHomeOrUserPage =
    pathname === "/" ||
    (segments.length === 1 && !["editor", "auth", "api"].includes(segments[0]));
  const isTransparentMobile =
    isHomeOrUserPage && isResolved && viewportMode === "mobile";

  const theme = background ? PAGE_THEMES[background] : null;
  const derivedLogoColor = theme
    ? deriveTextColor(theme.bg)
    : "var(--color-white)";

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
          <DesktopNav links={links} cta={cta} />
        </div>
        <div className={styles.mobileOnly}>
          <MobileNav
            isScrolled={isScrolled}
            isTransparentMobile={isTransparentMobile}
            derivedLogoColor={derivedLogoColor}
            links={links}
            cta={cta}
            secondaryCTA={secondaryCTA}
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
