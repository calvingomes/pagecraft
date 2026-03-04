import type { Block } from "@/types/editor";

export type WrapperRenderMode = "edit" | "view";

export function shouldUseTransparentWrapper(
  block: Block,
  mode: WrapperRenderMode,
): boolean {
  if (block.type === "paragraph") {
    return true;
  }

  if (block.type === "sectionTitle") {
    return mode === "view";
  }

  const canToggleBackground = block.type === "text" || block.type === "link";
  if (!canToggleBackground) {
    return false;
  }

  return block.styles?.transparentWrapper === true;
}
