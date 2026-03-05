/**
 * Converts HTML to plain text.
 * Uses DOM in the browser for accuracy and regex as a fallback for SSR.
 */
export function htmlToText(html: string | null | undefined): string {
  const trimmed = html?.trim();
  if (!trimmed) return "";

  let rawText: string;

  // Environment Check
  if (typeof window === "undefined" || typeof document === "undefined") {
    // SSR Fallback: Strip tags and replace with space
    rawText = trimmed.replace(/<[^>]*>/g, " ");
  } else {
    // Client-side: Use DOM for entity decoding (e.g., &amp; -> &)
    const el = document.createElement("div");
    el.innerHTML = trimmed;
    rawText = el.textContent ?? "";
  }

  // Final cleanup: collapse all whitespace/newlines into single spaces
  return rawText.replace(/\s+/g, " ").trim();
}
