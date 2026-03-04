import Link from "next/link";
import layoutStyles from "../../LandingLayout.module.css";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer} aria-label="Footer">
      <div className={layoutStyles.container}>
        <div id="careers" className={styles.srOnly} />
        <div className={styles.footerTop}>
          <div className={styles.footerMark} aria-hidden="true" />
          <div className={styles.footerCols}>
            <div className={styles.footerCol}>
              <div className={styles.footerHeading}>Product</div>
              <Link href="#products" className={styles.footerLink}>
                Products
              </Link>
              <Link href="#customers" className={styles.footerLink}>
                Customers
              </Link>
            </div>
            <div className={styles.footerCol}>
              <div className={styles.footerHeading}>Company</div>
              <Link href="/auth" className={styles.footerLink}>
                Sign in
              </Link>
              <Link href="/claim" className={styles.footerLink}>
                Book a demo
              </Link>
            </div>
            <div className={styles.footerCol}>
              <div className={styles.footerHeading}>Legal</div>
              <Link href="/" className={styles.footerLink}>
                Terms
              </Link>
              <Link href="/" className={styles.footerLink}>
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
