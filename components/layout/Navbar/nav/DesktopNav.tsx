"use client";

import Link from "next/link";
import { ThemeButton } from "@/components/ui/ThemeButton/ThemeButton";
import { ArrowRight } from "lucide-react";
import styles from "./DesktopNav.module.css";

interface DesktopNavProps {
  isScrolled: boolean;
}

export const DesktopNav = ({ isScrolled }: DesktopNavProps) => {
  return (
    <div className={styles.desktopNav}>
      <div className={styles.navLeft}>
        <Link href="/auth" className={styles.navLink}>
          Updates
        </Link>
      </div>

      <Link href="/" className={styles.navLogo}>
        PageCraft
      </Link>

      <div className={styles.navRight}>
        <ThemeButton
          label="Sign up"
          cta="/auth"
          bgColor="var(--color-success)"
          textColor="var(--color-white)"
          buttonWidth="auto"
          size="small"
          icon={ArrowRight}
        />
      </div>
    </div>
  );
};
