import Link from "next/link";
import { ClaimInput } from "@/components/ui/ClaimInput/ClaimInput";
import layoutStyles from "../../LandingLayout.module.css";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer} aria-label="Footer">
      <div className={`${layoutStyles.container} ${styles.footerContainer}`}>

        {/* Top Section: Headline + ClaimInput */}
        <div className={styles.footerTop}>
          <h2 className={styles.footerHeadline}>
            Your link.<br />Your brand.
          </h2>
          <div className={styles.claimWrapper}>
            <ClaimInput />
          </div>
        </div>

        {/* Middle Section: Big Brand Text */}
        <div className={styles.footerBrandContainer}>
          <h3 className={styles.footerBrandText}>
            PageCraft
          </h3>
        </div>

        {/* Bottom Section: Legal */}
        <div className={styles.footerBottom}>
          <span className={styles.footerLogo}>PageCraft</span>
          <div className={styles.footerBottomRight}>
            <Link href="#" className={styles.footerBottomLink}>Privacy</Link>
            <Link href="#" className={styles.footerBottomLink}>Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
