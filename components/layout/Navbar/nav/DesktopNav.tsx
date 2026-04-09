"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeButton } from "@/components/ui/ThemeButton/ThemeButton";
import { ArrowRight } from "lucide-react";
import type { NavLink, NavCTA } from "@/types/nav";
import styles from "./DesktopNav.module.css";

interface DesktopNavProps {
  links?: NavLink[];
  cta?: NavCTA;
  logoColor?: string;
  textColor?: string;
}

export const DesktopNav = ({ links = [], cta, logoColor, textColor }: DesktopNavProps) => {
  const hasLinksOrCTA = links.length > 0 || !!cta;

  return (
    <div className={`${styles.desktopNav} ${!hasLinksOrCTA ? styles.centeredLogo : ""}`}>
      <Link href="/" className={styles.navLogo} style={{ color: logoColor }}>
        <Image
          src="/logo/pagecraft-logo.svg"
          alt=""
          width={26}
          height={26}
          priority
          className={styles.logoImage}
        />
        PageCraft
      </Link>

      {hasLinksOrCTA && (
        <div className={styles.navRight}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink} style={{ color: textColor }}>
              {link.label}
            </Link>
          ))}
          {cta && (
            <ThemeButton
              label={cta.label}
              cta={cta.href}
              bgColor="var(--color-success)"
              textColor="var(--color-white)"
              buttonWidth="auto"
              size="small"
              icon={ArrowRight}
              trackingEvent={cta.trackingEvent}
            />
          )}
        </div>
      )}
    </div>
  );
};
