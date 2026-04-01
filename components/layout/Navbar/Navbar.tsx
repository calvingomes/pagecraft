"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useViewportMode } from "@/hooks/useViewportMode";
import type { PageBackgroundId } from "@/types/page";
import { PAGE_THEMES } from "@/lib/page-theme";
import { deriveTextColor } from "@/lib/utils/colorUtils";
import styles from "./Navbar.module.css";

const Navbar = ({ background }: { background?: PageBackgroundId }) => {
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

  const segments = pathname.split("/").filter(Boolean);
  const isTransparentMobilePage =
    pathname === "/" ||
    (segments.length === 1 && !["editor", "auth", "api"].includes(segments[0]));

  const { viewportMode, isResolved } = useViewportMode();
  const theme = background ? PAGE_THEMES[background] : null;
  const derivedLogoColor = theme
    ? deriveTextColor(theme.bg)
    : "var(--color-white)";

  return (
    <header
      className={`${styles.navWrapper} ${isScrolled ? styles.scrolled : ""} ${isTransparentMobilePage ? styles.transparentOnMobile : ""}`}
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
        <div className={styles.navSpacer} />

        <Link
          href="/"
          className={styles.navLogo}
          style={
            isResolved && viewportMode === "mobile" && isTransparentMobilePage && !isScrolled
              ? { color: derivedLogoColor }
              : undefined
          }
        >
          PageCraft
        </Link>
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
