import Image from "next/image";
import { ClaimInput } from "@/components/ui/ClaimInput/ClaimInput";
import { BottomBar } from "@/components/layout/Footer/BottomBar";
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
            Your page is waiting
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
        <BottomBar className={styles.footerBottom} />

      </div>
    </footer>
  );
}
