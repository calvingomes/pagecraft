/**
 * Appends a versioned cache-busting timestamp to a Supabase image URL.
 * It ignores external URLs and handles existing query parameters by stripping them first.
 * 
 * @param url The image URL to bust
 * @param version A string, number, or Date representing the version/lastUpdate
 * @returns The versioned URL or the original if external/empty
 */
export function getCacheBustedUrl(
  url: string | undefined | null,
  version: string | number | Date | undefined | null
) {
  if (!url) return "";

  // Only bust URLs that belong to Supabase Storage (which doesn't handle hashing automatically)
  if (!url.includes(".supabase.co")) return url;

  const timestamp =
    version instanceof Date
      ? version.getTime()
      : typeof version === "string"
      ? new Date(version).getTime()
      : version;

  // Strip any existing query params to avoid duplication
  const cleanUrl = url.split("?")[0];
  const separator = "?";

  return `${cleanUrl}${separator}v=${timestamp || "1"}`;
}
