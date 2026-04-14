import { blockRegistry } from "@/components/builder/BlockRegistry/blockRegistry";
import type { BlockRendererProps } from "@/types/builder";

/**
 * Main switchboard for rendering different block types.
 * Uses the blockRegistry for component lookups.
 */
export default function BlockRenderer({ 
  block, 
  isMapUnlocked,
  gridConfig,
}: BlockRendererProps) {
  // We use a small cast here to bridge the union type 'Block' 
  // with the specific block components in the registry.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const RenderComponent = blockRegistry[block.type] as React.ComponentType<any>;
  if (!RenderComponent) return null;

  return <RenderComponent block={block} isMapUnlocked={isMapUnlocked} gridConfig={block.type === 'map' ? gridConfig : undefined} />;
}
