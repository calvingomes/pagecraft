import type { LinkBlock } from "@/types/editor";
import { htmlToText } from "@/lib/utils/htmlToText";

export type { LinkMetadataResponse } from "@/types/editor";

export function resolveLinkTitle(content: LinkBlock["content"]): string {
  return content?.title ?? content?.metaTitle ?? "";
}

export function isSupportedLinkUrl(value: string): boolean {
  if (!value) return false;
  // Regex to match:
  // 1. Optional http:// or https://
  // 2. Optional www.
  // 3. Domain part (at least one dot and a suffix of 2+ chars)
  const urlRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
  return urlRegex.test(value.trim());
}

export function normalizeLinkUrl(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
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
