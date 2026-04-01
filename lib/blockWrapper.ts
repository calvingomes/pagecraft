import type { Block } from "@/types/editor";

export function shouldUseTransparentWrapper(
  block: Block,
): boolean {
  if (block.type === "sectionTitle") {
    return true;
  }

  const canToggleBackground = block.type === "text" || block.type === "link";
  if (!canToggleBackground) {
    return false;
  }

  return block.styles?.transparentWrapper === true;
}
