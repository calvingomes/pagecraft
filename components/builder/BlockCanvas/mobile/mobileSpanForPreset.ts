import type { BlockWidthPreset } from "@/types/editor";

export const mobileSpanForPreset = (
  preset: BlockWidthPreset | undefined,
): 1 | 2 => {
  switch (preset) {
    case "full":
    case "max":
    case "large":
    case "wide":
    case "skinnyWide":
      return 2;
    default:
      return 1;
  }
};
