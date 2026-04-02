"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useViewportMode } from "@/hooks/useViewportMode";
import type { PageBackgroundId } from "@/types/page";
import { PAGE_THEMES } from "@/lib/page-theme";
import { deriveTextColor } from "@/lib/utils/colorUtils";
import { ThemeButton } from "@/components/ui/ThemeButton/ThemeButton";
import { ArrowRight, Menu, X } from "lucide-react";
import styles from "./Navbar.module.css";

const Navbar = ({ background }: { background?: PageBackgroundId }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const pathname = usePathname();

  const handleCloseMenu = () => {
    setIsMenuClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsMenuClosing(false);
    }, 300); // matches the CSS duration
  };

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
        <div className={styles.navLeft}>
          <Link href="/auth" className={styles.navLink}>
            Updates
          </Link>
        </div>

        <Link
          href="/"
          className={styles.navLogo}
          style={
            isTransparentMobile && !isScrolled
              ? { color: derivedLogoColor }
              : undefined
          }
        >
          PageCraft
        </Link>

        <div className={styles.navRight}>
          <ThemeButton
            label="Sign up"
            cta="/auth"
            bgColor={
              isTransparentMobile && !isScrolled
                ? "transparent"
                : "var(--color-success)"
            }
            textColor={
              isTransparentMobile && !isScrolled
                ? "var(--color-white)"
                : "var(--color-white)"
            }
            borderColor={
              isTransparentMobile && !isScrolled
                ? "rgba(255, 255, 255, 0.4)"
                : undefined
            }
            buttonWidth="auto"
            size="small"
            icon={ArrowRight}
          />
        </div>

        {isResolved && viewportMode === "mobile" && (
          <button
            type="button"
            className={styles.mobileMenuTrigger}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
        )}
      </nav>
      {isMobileMenuOpen && (
        <div
          className={`${styles.mobileMenuOverlay} ${isMenuClosing ? styles.closing : ""}`}
          role="dialog"
          aria-modal="true"
          onClick={handleCloseMenu}
        >
          <div
            className={`${styles.mobileMenuPanel} ${isMenuClosing ? styles.closing : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.mobileMenuHeader}>
              <Link href="/" className={styles.mobileMenuLogo}>
                PageCraft
              </Link>
              <button
                type="button"
                className={styles.mobileMenuClose}
                onClick={handleCloseMenu}
                aria-label="Close navigation menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className={styles.mobileMenuLinks}>
              <Link
                href="/auth"
                className={styles.mobileMenuLink}
                onClick={handleCloseMenu}
              >
                Updates
              </Link>
              <Link
                href="/editor"
                className={styles.mobileMenuLink}
                onClick={handleCloseMenu}
              >
                Editor
              </Link>
            </div>

            <div className={styles.mobileMenuFooter}>
              <Link
                href="/auth"
                className={styles.mobileMenuLinkInline}
                onClick={handleCloseMenu}
              >
                Sign in
              </Link>

              <ThemeButton
                label="Sign up for free"
                cta="/auth"
                bgColor="var(--color-success)"
                textColor="var(--color-white)"
                buttonWidth="auto"
                size="medium"
                icon={ArrowRight}
              />
            </div>
          </div>
        </div>
      )}
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
