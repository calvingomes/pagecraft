import Link from "next/link";
import Image from "next/image";
import { ClaimInput } from "@/components/ui/ClaimInput/ClaimInput";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer} aria-label="Footer">
      <Image
        src="/svg/hero-arcs.svg"
        alt=""
        fill
        className={styles.arcSvg}
        aria-hidden
      />
      <div className={`container ${styles.footerContainer}`}>

        {/* Top: Headline + ClaimInput centered */}
        <div className={styles.footerTop}>
          <h2 className={styles.footerHeadline}>
            Claim your page today
          </h2>
          <div className={styles.claimWrapper}>
            <ClaimInput />
          </div>
        </div>

        {/* Big Brand Text */}
        <div className={styles.footerBrandContainer}>
          <h3 className={styles.footerBrandText}>PageCraft</h3>
        </div>

        {/* Bottom Bar */}
        <div className={styles.footerBottom}>
          <span className={styles.footerLogo}>PageCraft</span>
          <div className={styles.footerBottomRight}>
            <Link href="#" className={styles.footerBottomLink}>Privacy</Link>
            <span className={styles.footerDot}>·</span>
            <Link href="#" className={styles.footerBottomLink}>Terms</Link>
            <span className={styles.footerDot}>·</span>
            <Link href="#" className={styles.footerBottomLink}>Cookie Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
