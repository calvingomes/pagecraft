import type { BlockWidthPreset, LinkBlock } from "@/types/editor";
import { htmlToText } from "@/helper/htmlToText";

export type LinkMetadataResponse = {
  title: string | null;
  imageUrl: string | null;
  iconUrl: string | null;
};

export function resolveLinkTitle(content: LinkBlock["content"]): string {
  return content?.title ?? content?.metaTitle ?? "";
}

export function isSupportedLinkUrl(value: string): boolean {
  if (!value) return false;

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function getLinkHostOrUrl(value: string): string {
  try {
    return new URL(value).host;
  } catch {
    return value;
  }
}

export function shouldShowLinkPreviewImage(
  preset: BlockWidthPreset | undefined,
): boolean {
  return preset === "large" || preset === "tall" || preset === "wide";
}

export function shouldAutoApplyFetchedTitle(args: {
  currentTitle?: string;
  currentMetaTitle?: string;
}): boolean {
  const prevMetaTitle = (args.currentMetaTitle ?? "").trim();
  const prevTitleRaw = (args.currentTitle ?? "").trim();
  const prevTitle = htmlToText(prevTitleRaw);

  return (
    !prevTitle || (prevMetaTitle.length > 0 && prevTitle === prevMetaTitle)
  );
}
