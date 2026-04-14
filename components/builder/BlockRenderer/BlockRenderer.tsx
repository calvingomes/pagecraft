import type { Block } from "@/types/editor";
import { blockRegistry } from "@/components/builder/BlockRegistry/blockRegistry";

export default function BlockRenderer({ 
  block, 
  ...extraProps 
}: { 
  block: Block; 
  [key: string]: any; 
}) {
  const render = blockRegistry[block.type];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return render ? render({ block: block as any, ...extraProps }) : null;
}
