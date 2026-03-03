import type { BlockWidthPreset } from "@/types/editor";

export const mobileSpanForPreset = (
  preset: BlockWidthPreset | undefined,
): 1 | 2 => {
  switch (preset) {
    case "large":
    case "wide":
      return 2;
    default:
      return 1;
  }
};
