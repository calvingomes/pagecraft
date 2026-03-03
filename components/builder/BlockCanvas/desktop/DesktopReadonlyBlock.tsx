"use client";

import type { Block } from "@/types/editor";
import BlockRenderer from "@/components/builder/BlockRenderer/BlockRenderer";
import sortableBlockStyles from "@/components/builder/SortableBlock/SortableBlock.module.css";
import { sizePxForPreset } from "@/lib/blockGrid";

type Props = {
  block: Block;
};

export function DesktopReadonlyBlock({ block }: Props) {
  const preset = block.styles?.widthPreset ?? "small";
  const { widthPx, heightPx } = sizePxForPreset(preset);

  return (
    <div className={sortableBlockStyles.hoverZone}>
      <div
        className={sortableBlockStyles.wrapper}
        style={{
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          maxWidth: "100%",
          maxHeight: "100%",
          cursor: "default",
        }}
      >
        <div className={sortableBlockStyles.content}>
          <div className={sortableBlockStyles.blockContent}>
            <BlockRenderer block={block} />
          </div>
        </div>
      </div>
    </div>
  );
}
