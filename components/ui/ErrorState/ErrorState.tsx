"use client";

import { ThemeButton } from "@/components/ui/ThemeButton/ThemeButton";
import type { ThemeButtonProps } from "@/components/ui/ThemeButton/ThemeButton.types";
import styles from "./ErrorState.module.css";
import { ArrowRight } from "lucide-react";

interface ErrorStateProps {
  title: string;
  description: string;
  cta?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export const ErrorState = ({ title, description, cta }: ErrorStateProps) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      {cta && (
        <div className={styles.ctaWrapper}>
          <ThemeButton
            label={cta.label}
            cta={(cta.href || cta.onClick) as ThemeButtonProps["cta"]}
            bgColor="var(--color-yellow)"
            textColor="var(--color-white)"
            buttonWidth="auto"
            icon={ArrowRight}
            size="medium"
          />
        </div>
      )}
    </div>
  );
};
