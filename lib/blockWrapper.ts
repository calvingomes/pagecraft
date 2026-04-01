import type { Block } from "@/types/editor";

export type WrapperRenderMode = "edit" | "view";

export function shouldUseTransparentWrapper(
  block: Block,
  mode: WrapperRenderMode,
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
