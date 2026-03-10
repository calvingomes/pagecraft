import Link from "next/link";
import layoutStyles from "../../LandingLayout.module.css";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer} aria-label="Footer">
      <div className={`${layoutStyles.container} ${styles.footerContainer}`}>
        
        {/* Top Section: Heading & Links */}
        <div className={styles.footerTop}>
          <h2 className={styles.footerHeadline}>
            Experience the future<br />of page building.
          </h2>

          <div className={styles.footerLinksGrid}>
            {/* Column 1 */}
            <div className={styles.footerLinkColumn}>
              <Link href="#" className={styles.footerLink}>Download</Link>
              <Link href="#" className={styles.footerLink}>Product</Link>
              <Link href="#" className={styles.footerLink}>Docs</Link>
              <Link href="#" className={styles.footerLink}>Changelog</Link>
            </div>

            {/* Column 2 */}
            <div className={styles.footerLinkColumn}>
              <Link href="#" className={styles.footerLink}>Blog</Link>
              <Link href="#" className={styles.footerLink}>Pricing</Link>
              <Link href="#" className={styles.footerLink}>Use Cases</Link>
              <Link href="/auth" className={styles.footerLink}>Sign In</Link>
            </div>
          </div>
        </div>

        {/* Middle Section: Big Brand Text */}
        <div className={styles.footerBrandContainer}>
          <h1 className={styles.footerBrandText}>
            PageCraft
          </h1>
        </div>

        {/* Bottom Section: Legal & Meta */}
        <div className={styles.footerBottom}>
          <div className={styles.footerBottomLeft}>
            <span className={styles.footerLogo}>PageCraft</span>
            <Link href="#" className={styles.footerBottomLink}>About PageCraft</Link>
            <Link href="#" className={styles.footerBottomLink}>Products</Link>
          </div>
          
          <div className={styles.footerBottomRight}>
            <Link href="#" className={styles.footerBottomLink}>Privacy</Link>
            <Link href="#" className={styles.footerBottomLink}>Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
