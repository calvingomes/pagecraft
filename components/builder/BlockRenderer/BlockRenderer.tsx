import type { Block } from "@/types/editor";
import { blockRegistry } from "@/components/builder/BlockRegistry/blockRegistry";

export default function BlockRenderer({ block }: { block: Block }) {
  const render = blockRegistry[block.type];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return render ? render(block as any) : null;
}
