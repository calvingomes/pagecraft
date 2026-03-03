import type { Block } from "@/types/editor";
import { blockRegistry } from "@/components/builder/BlockRegistry/blockRegistry";

export default function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "text":
      return blockRegistry.text(block);
    case "link":
      return blockRegistry.link(block);
    case "image":
      return blockRegistry.image(block);
    case "sectionTitle":
      return blockRegistry.sectionTitle(block);
    default:
      return null;
  }
}
