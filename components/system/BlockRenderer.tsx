// components/BlockRenderer.tsx
import { Block } from "@/types/block";
import { blockRegistry } from "./blockRegistry";

export default function BlockRenderer({ block }: { block: Block }) {
  const Renderer = blockRegistry[block.type];
  return Renderer ? Renderer(block as never) : null;
}
