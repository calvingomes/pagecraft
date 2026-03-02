import type { BlockWidthPreset } from "@/types/editor";

export const mobileSpanForPreset = (
  preset: BlockWidthPreset | undefined,
): 1 | 2 => {
  switch (preset) {
    case "medium":
    case "wide":
    case "skinnyTall":
      return 2;
    default:
      return 1;
  }
};
