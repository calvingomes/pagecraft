import { Block, TextBlock, LinkBlock } from "@/types/block";
import type { ReactNode } from "react";

type BlockComponent<T extends Block> = (block: T) => ReactNode;

export const blockRegistry: {
  text: BlockComponent<TextBlock>;
  link: BlockComponent<LinkBlock>;
} = {
  text: (block) => <p>{block.data.text}</p>,

  link: (block) => (
    <a href={block.data.url} target="_blank" rel="noopener noreferrer">
      {block.data.label}
    </a>
  ),
};
