import type { AddBlockOptions } from "@/components/builder/Toolbars/Toolbar.types";
import { fileToWebpDataUrl } from "@/lib/uploads/imageWebp";
import { IMAGE_LIMITS } from "@/lib/uploads/uploadConfig";

export async function prepareImageBlockOptions(
  blockId: string,
  options?: AddBlockOptions,
): Promise<AddBlockOptions | undefined> {
  if (!options?.file) {
    return options;
  }

  const localDataUrl = await fileToWebpDataUrl(
    options.file,
    `block-${blockId}.webp`,
    {
      maxWidthOrHeight: IMAGE_LIMITS.BLOCK,
    },
  );

  return {
    ...options,
    url: localDataUrl,
  };
}
