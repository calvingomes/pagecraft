import { Loader2 } from "lucide-react";
import styles from "./Button.module.css";
import type { ButtonProps } from "./Button.types";

export function Button({
  children,
  isLoading,
  leftIcon,
  rightIcon,
  variant = "secondary",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const rootClass = `${styles.button} ${styles[variant]} ${className}`;

  return (
    <button
      type="button"
      className={rootClass}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className={`${styles.icon} ${styles.spin}`} />}
      {!isLoading && leftIcon && <span className={styles.iconWrap}>{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className={styles.iconWrap}>{rightIcon}</span>}
    </button>
  );
}
