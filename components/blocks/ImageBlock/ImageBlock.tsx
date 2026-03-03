"use client";

import { ImageBlock as ImageBlockType } from "@/types/editor";
import Image from "next/image";
import styles from "./ImageBlock.module.css";

export const ImageBlock = ({ block }: { block: ImageBlockType }) => {
  if (!block?.content?.url?.trim()) return null;

  return (
    <div className={styles.imageBlock}>
      <Image
        src={block.content.url}
        loading="lazy"
        alt={block.content.alt ?? ""}
        fill
        sizes="(max-width: 768px) 100vw, 600px"
        style={{ objectFit: "cover" }}
      />
    </div>
  );
};
