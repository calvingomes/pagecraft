"use client";

import { ArrowRight } from "lucide-react";
import { ThemeButton } from "@/components/ui/ThemeButton/ThemeButton";
import styles from "./MobileUsernameCta.module.css";

export function MobileUsernameCta() {
  return (
    <div className={styles.mobileCtaDock}>
      <ThemeButton
        label="Craft your page"
        cta="/"
        size="small"
        buttonWidth="fit-content"
        bgColor="var(--color-success)"
        textColor="var(--color-white)"
        icon={ArrowRight}
        trackingEvent="username_page_cta_click"
      />
    </div>
  );
}
