import {
  TextBlock as TextBlockType,
  LinkBlock as LinkBlockType,
  ImageBlock as ImageBlockType,
  SectionTitleBlock as SectionTitleBlockType,
  MapBlock as MapBlockType,
} from "@/types/editor";
import { TextBlock } from "@/components/blocks/TextBlock/TextBlock";
import { LinkBlock } from "@/components/blocks/LinkBlock/LinkBlock";
import { ImageBlock } from "@/components/blocks/ImageBlock/ImageBlock";
import { SectionTitleBlock } from "@/components/blocks/SectionTitleBlock/SectionTitleBlock";
import { MapBlock } from "@/components/blocks/MapBlock/MapBlock";
import type { ReactNode } from "react";

type BlockRendererMap = {
  text: (props: { block: TextBlockType } & any) => ReactNode;
  link: (props: { block: LinkBlockType } & any) => ReactNode;
  image: (props: { block: ImageBlockType } & any) => ReactNode;
  sectionTitle: (props: { block: SectionTitleBlockType } & any) => ReactNode;
  map: (props: { block: MapBlockType } & any) => ReactNode;
};

export const blockRegistry: BlockRendererMap = {
  text: ({ block, ...props }) => <TextBlock block={block} {...props} />,
  link: ({ block, ...props }) => <LinkBlock block={block} {...props} />,
  image: ({ block, ...props }) => <ImageBlock block={block} {...props} />,
  sectionTitle: ({ block, ...props }) => <SectionTitleBlock block={block} {...props} />,
  map: ({ block, ...props }) => <MapBlock block={block} {...props} />,
};
