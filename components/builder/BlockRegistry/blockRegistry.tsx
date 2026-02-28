import {
  Block,
  TextBlock as TextBlockType,
  LinkBlock as LinkBlockType,
  ImageBlock as ImageBlockType,
} from "@/types/editor";
import { TextBlock } from "@/components/blocks/TextBlock/TextBlock";
import { LinkBlock } from "@/components/blocks/LinkBlock/LinkBlock";
import { ImageBlock } from "@/components/blocks/ImageBlock/ImageBlock";
import type { ReactNode } from "react";

type BlockRendererMap = {
  text: (b: TextBlockType) => ReactNode;
  link: (b: LinkBlockType) => ReactNode;
  image: (b: ImageBlockType) => ReactNode;
};

export const blockRegistry: BlockRendererMap = {
  text: (b) => <TextBlock block={b} />,
  link: (b) => <LinkBlock block={b} />,
  image: (b) => <ImageBlock block={b} />,
};
