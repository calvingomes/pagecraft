import type { AddBlockOptions } from "@/components/builder/Toolbars/Toolbar.types";
import { fileToWebpDataUrl } from "@/lib/uploads/imageWebp";

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
      maxWidthOrHeight: 2000,
    },
  );

  return {
    ...options,
    url: localDataUrl,
  };
}
