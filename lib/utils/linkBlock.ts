import type { LinkBlock } from "@/types/editor";
import { htmlToText } from "@/lib/utils/htmlToText";

export type { LinkMetadataResponse } from "@/types/editor";

export function resolveLinkTitle(content: LinkBlock["content"]): string {
  return content?.title ?? content?.metaTitle ?? "";
}

export function isSupportedLinkUrl(value: string): boolean {
  if (!value) return false;
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
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

export function shouldAutoApplyFetchedTitle(args: {
  currentTitle?: string;
  currentMetaTitle?: string;
}): boolean {
  const prevMetaTitle = (args.currentMetaTitle ?? "").trim();
  const prevTitle = htmlToText(args.currentTitle);

  return (
    !prevTitle || (prevMetaTitle.length > 0 && prevTitle === prevMetaTitle)
  );
}
