import Link from "next/link";
import styles from "./BottomBar.module.css";

interface BottomBarProps {
  className?: string;
}

export function BottomBar({ className }: BottomBarProps) {
  return (
    <div className={`${styles.bottomBar} ${className || ""}`}>
      <div className={styles.bottomBarContents}>
        <Link href="/" className={styles.logo}>PageCraft</Link>
        <div className={styles.links}>
          <Link href="/privacy-policy" className={styles.link}>
            Privacy
          </Link>
          <span className={styles.dot}>·</span>
          <Link href="/terms" className={styles.link}>
            Terms
          </Link>
          <span className={styles.dot}>·</span>
          <Link href="/cookie-policy" className={styles.link}>
            Cookie Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
