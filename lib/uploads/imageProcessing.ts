import imageCompression from "browser-image-compression";
import type { WebpOptions } from "@/types/uploads";

export function dataUrlToFile(dataUrl: string, fileName: string): File {
  const parts = dataUrl.split(",");
  if (parts.length !== 2) {
    throw new Error("Invalid image data URL.");
  }

  const mimeMatch = parts[0].match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] ?? "image/png";
  const base64 = parts[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], fileName, { type: mimeType });
}

export async function convertFileToWebp(
  file: File,
  fileName: string,
  options: WebpOptions = {},
): Promise<File> {
  const compressed = await imageCompression(file, {
    fileType: "image/webp",
    maxSizeMB: options.maxSizeMB ?? 1,
    maxWidthOrHeight: options.maxWidthOrHeight ?? 1600,
    useWebWorker: true,
    initialQuality: options.quality ?? 0.8,
  });

  return new File([compressed], fileName, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

export async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read image file."));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("File read failed."));
    reader.readAsDataURL(file);
  });
}
