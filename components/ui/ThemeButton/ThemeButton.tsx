"use client";

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { deriveTextColor } from '@/lib/utils/colorUtils';
import styles from './ThemeButton.module.css';

export interface ThemeButtonProps {
  label: string;
  cta: (() => void) | ((e: React.FormEvent) => void) | string;
  icon?: LucideIcon | React.ElementType;
  bgColor: string;
  textColor?: string;
  iconCircle?: boolean;
  disabled?: boolean;
}

export const ThemeButton = ({
  label,
  cta,
  icon: Icon,
  bgColor,
  textColor,
  iconCircle = true,
  disabled = false,
}: ThemeButtonProps) => {
  const isLink = typeof cta === 'string';
  const resolvedTextColor = textColor ?? deriveTextColor(bgColor);
  const customStyle = { backgroundColor: bgColor, color: resolvedTextColor };

  const content = (
    <>
      <span>{label}</span>
      {Icon && (
        iconCircle ? (
          <Icon className={styles.icon} />
        ) : (
          <Icon className={styles.iconFlat} />
        )
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
