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
  borderColor,
  buttonWidth,
  disabled = false,
}: ThemeButtonProps) => {
  const isLink = typeof cta === "string";
  const resolvedTextColor = textColor ?? deriveTextColor(bgColor);
  const customStyle = { 
    backgroundColor: bgColor, 
    color: resolvedTextColor,
    width: buttonWidth ?? "100%",
    border: borderColor ? `1px solid ${borderColor}` : "none",
  };

  const content = (
    <>
      <span>{label}</span>
      {Icon && (
        <div className={styles.iconContainer}>
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
