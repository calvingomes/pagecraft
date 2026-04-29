import type { Block, BlockType } from "@/types/editor";
import type { AddBlockOptions } from "@/components/builder/Toolbars/Toolbar.types";

export const getDefaultContent = (
  type: BlockType,
  options?: AddBlockOptions,
): Block["content"] => {
  switch (type) {
    case "text":
      return { text: "" };
    case "link":
      return {
        url: options?.url ?? "",
        title: options?.title ?? "",
      };
    case "image":
      return { url: options?.url ?? "", alt: options?.alt ?? "" };
    case "sectionTitle":
      return { title: "" };
    case "map":
      return {
        address: "",
        lat: 50.1109,
        lng: 8.6821,
        zoom: 12,
      };
  }
};
