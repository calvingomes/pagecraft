import { DotPulse } from "@/components/ui/DotPulse/DotPulse";
import styles from "./PageLoader.module.css";

interface PageLoaderProps {
  label?: string;
  backgroundColor?: string;
}

export const PageLoader = ({ label, backgroundColor }: PageLoaderProps) => {
  return (
    <div
      className={styles.container}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <DotPulse />
      {label && <p className={styles.label}>{label}</p>}
    </div>
  );
};
