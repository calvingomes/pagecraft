import { TextBlock as TextBlockType } from "@/types/editor";
import styles from "./TextBlock.module.css";

export const TextBlock = ({ block }: { block: TextBlockType }) => {
  if (!block?.content?.text) return null;

  return (
    <div className={styles.textBlock}>
      <p>{block.content.text}</p>
    </div>
  );
};
