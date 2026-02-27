import { LinkBlock as LinkBlockType } from "@/types/editor";
import styles from "./LinkBlock.module.css";

export const LinkBlock = ({ block }: { block: LinkBlockType }) => {
  if (!block?.content?.url) return null;

  return (
    <div className={styles.linkBlock}>
      <a href={block.content.url} target="_blank" rel="noopener noreferrer">
        {block.content.label}
      </a>
    </div>
  );
};
