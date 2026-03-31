import styles from "./DotPulse.module.css";

interface DotPulseProps {
  color?: string;
  className?: string;
}

export const DotPulse = ({ color, className = "" }: DotPulseProps) => {
  return (
    <div className={`${styles.dotPulse} ${className}`}>
      <span style={color ? { background: color } : undefined} />
      <span style={color ? { background: color } : undefined} />
      <span style={color ? { background: color } : undefined} />
    </div>
  );
};
