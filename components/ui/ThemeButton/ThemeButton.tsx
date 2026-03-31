"use client";

import React from "react";
import Link from "next/link";
import { deriveTextColor } from "@/lib/utils/colorUtils";
import type { ThemeButtonProps } from "./ThemeButton.types";
import styles from "./ThemeButton.module.css";

export const ThemeButton = ({
  label,
  cta,
  icon: Icon,
  bgColor,
  textColor,
  iconCircle = true,
  buttonWidth,
  disabled = false,
}: ThemeButtonProps) => {
  const isLink = typeof cta === "string";
  const resolvedTextColor = textColor ?? deriveTextColor(bgColor);
  const customStyle = { 
    backgroundColor: bgColor, 
    color: resolvedTextColor,
    width: buttonWidth ?? "100%",
  };

  const content = (
    <>
      <span>{label}</span>
      {Icon && (
        <div className={iconCircle ? styles.iconCircleWrapper : styles.iconFlatWrapper}>
          <Icon aria-hidden className={styles.svgPrimary} />
          <Icon aria-hidden className={styles.svgSecondary} />
        </div>
      )}
    </>
  );

  if (isLink) {
    return (
      <Link href={cta as string} className={styles.button} style={customStyle}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={cta as () => void}
      style={customStyle}
      disabled={disabled}
    >
      {content}
    </button>
  );
};
