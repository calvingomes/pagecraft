import { Block } from "@/types/editor";
import type { ReactNode } from "react";

export type BlockRendererMap = {
  [K in Block["type"]]: (b: Extract<Block, { type: K }>) => ReactNode;
};

export const blockRegistry: BlockRendererMap = {
  text: (b) => <p>{b.content.text}</p>,
  link: (b) => (
    <a href={b.content.url} target="_blank" rel="noopener noreferrer">
      {b.content.label}
    </a>
  ),
  image: (b) => <img src={b.content.url} alt={b.content.alt ?? ""} />,
};
