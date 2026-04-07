import type { BlockType, BlockStyles } from "@/types/editor";

export function shouldUseTransparentWrapper(
  blockType: BlockType,
  styles?: BlockStyles,
): boolean {
  if (blockType === "sectionTitle") {
    return true;
  }

  const canToggleBackground = blockType === "text" || blockType === "link";
  if (!canToggleBackground) {
    return false;
  }

  return styles?.transparentWrapper === true;
}
