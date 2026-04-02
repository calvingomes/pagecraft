"use client";

import Link from "next/link";
import { ThemeButton } from "@/components/ui/ThemeButton/ThemeButton";
import { ArrowRight } from "lucide-react";
import type { NavLink, NavCTA } from "@/types/nav";
import styles from "./DesktopNav.module.css";

interface DesktopNavProps {
  links?: NavLink[];
  cta?: NavCTA;
}

export const DesktopNav = ({ links = [], cta }: DesktopNavProps) => {
  const leftLinks = links.filter((link) => (link.position ?? "left") === "left");
  const rightLinks = links.filter((link) => link.position === "right");

  return (
    <div className={styles.desktopNav}>
      <div className={styles.navLeft}>
        {leftLinks.map((link) => (
          <Link key={link.href} href={link.href} className={styles.navLink}>
            {link.label}
          </Link>
        ))}
      </div>

      <Link href="/" className={styles.navLogo}>
        PageCraft
      </Link>

      <div className={styles.navRight}>
        {rightLinks.map((link) => (
          <Link key={link.href} href={link.href} className={styles.navLink}>
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
          />
        )}
      </div>
    </div>
  );
};
