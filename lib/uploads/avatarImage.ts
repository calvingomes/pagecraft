import {
  convertFileToWebp,
  dataUrlToFile,
} from "@/lib/uploads/imageProcessing";

export async function avatarDataUrlToWebpFile(
  dataUrl: string,
  username: string,
): Promise<File> {
  const sourceFile = dataUrlToFile(dataUrl, `avatar-${username}`);
  return convertFileToWebp(sourceFile, `avatar-${username}.webp`, {
    maxSizeMB: 2,
    maxWidthOrHeight: 1600,
    quality: 0.8,
  });
}
