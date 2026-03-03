import {
  convertFileToWebp,
  dataUrlToFile,
  fileToDataUrl,
} from "@/lib/uploads/imageProcessing";
import type { WebpOptions } from "@/types/uploads";

export type { WebpOptions } from "@/types/uploads";

const DEFAULT_WEBP_OPTIONS: Required<WebpOptions> = {
  maxSizeMB: 2,
  maxWidthOrHeight: 1600,
  quality: 0.8,
};

export async function toWebpFile(
  file: File,
  outputFileName: string,
  options: WebpOptions = {},
): Promise<File> {
  return convertFileToWebp(file, outputFileName, {
    maxSizeMB: options.maxSizeMB ?? DEFAULT_WEBP_OPTIONS.maxSizeMB,
    maxWidthOrHeight:
      options.maxWidthOrHeight ?? DEFAULT_WEBP_OPTIONS.maxWidthOrHeight,
    quality: options.quality ?? DEFAULT_WEBP_OPTIONS.quality,
  });
}

export async function fileToWebpDataUrl(
  file: File,
  outputFileName: string,
  options: WebpOptions = {},
): Promise<string> {
  const webpFile = await toWebpFile(file, outputFileName, options);
  return fileToDataUrl(webpFile);
}

export async function dataUrlToWebpFile(
  dataUrl: string,
  outputFileName: string,
  options: WebpOptions = {},
): Promise<File> {
  const sourceFile = dataUrlToFile(dataUrl, outputFileName);
  return toWebpFile(sourceFile, outputFileName, options);
}
