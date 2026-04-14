import { TextBlock } from "@/components/blocks/TextBlock/TextBlock";
import { LinkBlock } from "@/components/blocks/LinkBlock/LinkBlock";
import { ImageBlock } from "@/components/blocks/ImageBlock/ImageBlock";
import { SectionTitleBlock } from "@/components/blocks/SectionTitleBlock/SectionTitleBlock";
import { MapBlock } from "@/components/blocks/MapBlock/MapBlock";
import type { BlockRendererMap } from "@/types/builder";

export const blockRegistry: BlockRendererMap = {
  text: ({ block }) => <TextBlock block={block} />,
  link: ({ block }) => <LinkBlock block={block} />,
  image: ({ block }) => <ImageBlock block={block} />,
  sectionTitle: ({ block }) => <SectionTitleBlock block={block} />,
  map: ({ block, isMapUnlocked, gridConfig }) => (
    <MapBlock block={block} isMapUnlocked={isMapUnlocked} gridConfig={gridConfig} />
  ),
};
