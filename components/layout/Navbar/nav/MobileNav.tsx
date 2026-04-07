"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeButton } from "@/components/ui/ThemeButton/ThemeButton";
import { ArrowRight, Menu, X } from "lucide-react";
import type { NavLink, NavCTA } from "@/types/nav";
import styles from "./MobileNav.module.css";

interface MobileNavProps {
  isScrolled: boolean;
  isTransparentMobile: boolean;
  links?: NavLink[];
  cta?: NavCTA;
  secondaryCTA?: NavCTA;
}

export const MobileNav = ({
  isScrolled,
  isTransparentMobile,
  links = [],
  cta,
  secondaryCTA,
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
      <Link href="/" className={styles.navLogo}>
        <Image
          src="/logo/pagecraft-logo.svg"
          alt=""
          width={24}
          height={24}
          priority
          className={styles.logoImage}
        />
        PageCraft
      </Link>

      {links.length > 0 ? (
        <button
          type="button"
          className={styles.mobileMenuTrigger}
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
      ) : (
        cta && (
          <div className={styles.ctaWrapper}>
            <ThemeButton
              label={cta.label}
              cta={cta.href}
              bgColor="var(--color-success)"
              textColor="var(--color-white)"
              buttonWidth="auto"
              size="small"
              icon={ArrowRight}
            />
          </div>
        )
      )}

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
                <Image
                  src="/logo/pagecraft-logo.svg"
                  alt=""
                  width={24}
                  height={24}
                  priority
                />
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
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.mobileMenuLink}
                  onClick={handleCloseMenu}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className={styles.mobileMenuFooter}>
              {secondaryCTA && (
                <Link
                  href={secondaryCTA.href}
                  className={styles.mobileMenuLinkInline}
                  onClick={handleCloseMenu}
                >
                  {secondaryCTA.label}
                </Link>
              )}

              {cta && (
                <ThemeButton
                  label={cta.label}
                  cta={cta.href}
                  bgColor="var(--color-success)"
                  textColor="var(--color-white)"
                  buttonWidth="auto"
                  size="medium"
                  icon={ArrowRight}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
