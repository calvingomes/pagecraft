import {
  TextBlock as TextBlockType,
  LinkBlock as LinkBlockType,
  ImageBlock as ImageBlockType,
  SectionTitleBlock as SectionTitleBlockType,
} from "@/types/editor";
import { TextBlock } from "@/components/blocks/TextBlock/TextBlock";
import { LinkBlock } from "@/components/blocks/LinkBlock/LinkBlock";
import { ImageBlock } from "@/components/blocks/ImageBlock/ImageBlock";
import { SectionTitleBlock } from "@/components/blocks/SectionTitleBlock/SectionTitleBlock";
import type { ReactNode } from "react";

type BlockRendererMap = {
  text: (b: TextBlockType) => ReactNode;
  link: (b: LinkBlockType) => ReactNode;
  image: (b: ImageBlockType) => ReactNode;
  sectionTitle: (b: SectionTitleBlockType) => ReactNode;
};

export const blockRegistry: BlockRendererMap = {
  text: (b) => <TextBlock block={b} />,
  link: (b) => <LinkBlock block={b} />,
  image: (b) => <ImageBlock block={b} />,
  sectionTitle: (b) => <SectionTitleBlock block={b} />,
};
