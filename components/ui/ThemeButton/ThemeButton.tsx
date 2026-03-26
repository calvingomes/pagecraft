"use client";

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import styles from './ThemeButton.module.css';

export interface ThemeButtonProps {
  label: string;
  cta: (() => void) | ((e: React.FormEvent) => void) | string;
  icon?: LucideIcon | React.ElementType;
  bgColor?: string;
  textColor?: string;
  iconCircle?: boolean;
}

export const ThemeButton = ({
  label,
  cta,
  icon: Icon,
  bgColor = 'var(--color-brand-primary)',
  textColor = 'var(--color-white)',
  iconCircle = true,
}: ThemeButtonProps) => {
  const isLink = typeof cta === 'string';
  const customStyle = { backgroundColor: bgColor, color: textColor };

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
    >
      {content}
    </button>
  );
};
