/* eslint-disable css-modules/no-undef-class */
"use client";

import type { Block } from "@/types/editor";
import type { BlockDimensions } from "@/types/builder";
import BlockRenderer from "@/components/builder/BlockRenderer/BlockRenderer";
import sortableBlockStyles from "@/components/builder/SortableBlock/SortableBlock.module.css";
import { shouldUseTransparentWrapper } from "@/lib/blockWrapper";

type Props = {
  block: Block;
  dimensions: BlockDimensions;
};

export function DesktopReadonlyBlock({ block, dimensions }: Props) {
  const { widthPx, heightPx } = dimensions;
  const isTransparentWrapper = shouldUseTransparentWrapper(block, "view");

  return (
    <div className={sortableBlockStyles.hoverZone}>
      <div
        className={`${sortableBlockStyles.wrapper} ${isTransparentWrapper ? sortableBlockStyles.emptyWrapper : ""}`}
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
