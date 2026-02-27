import { ImageBlock as ImageBlockType } from "@/types/editor";
import Image from "next/image";
import styles from "./ImageBlock.module.css";

export const ImageBlock = ({ block }: { block: ImageBlockType }) => {
  if (!block?.content?.url) return null;

  return (
    <div className={styles.imageBlock}>
      <Image
        src={block.content.url}
        alt={block.content.alt ?? ""}
        width={600}
        height={400}
        objectFit="cover"
      />
    </div>
  );
};
