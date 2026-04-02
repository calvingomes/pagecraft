"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeButton } from "@/components/ui/ThemeButton/ThemeButton";
import { ArrowRight, Menu, X } from "lucide-react";
import styles from "./MobileNav.module.css";

interface MobileNavProps {
  isScrolled: boolean;
  isTransparentMobile: boolean;
  derivedLogoColor: string;
}

export const MobileNav = ({
  isScrolled,
  isTransparentMobile,
  derivedLogoColor,
}: MobileNavProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);

  const handleCloseMenu = () => {
    setIsMenuClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsMenuClosing(false);
    }, 300);
  };

  return (
    <div
      className={`${styles.mobileNav} ${isTransparentMobile ? styles.transparentOnMobile : ""} ${isScrolled ? styles.scrolled : ""}`}
    >
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

      <button
        type="button"
        className={styles.mobileMenuTrigger}
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

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
    </div>
  );
};
