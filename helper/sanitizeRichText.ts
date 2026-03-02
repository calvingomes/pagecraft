/**
 * Allows only: paragraphs + bold/italic/underline.
 * Strips all attributes and removes all other tags.
 *
 * Note: This is intentionally strict and isomorphic (no DOMParser).
 */
export function sanitizeMinimalRichTextHtml(input: string): string {
  const html = (input ?? "").trim();
  if (!html) return "";

  // Normalize common equivalents first.
  let out = html
    .replace(/<\s*b\b[^>]*>/gi, "<strong>")
    .replace(/<\s*\/\s*b\s*>/gi, "</strong>")
    .replace(/<\s*i\b[^>]*>/gi, "<em>")
    .replace(/<\s*\/\s*i\s*>/gi, "</em>");

  // Remove all tags except the allowlist.
  out = out.replace(/<(?!\/?\s*(p|br|strong|em|u)\b)[^>]*>/gi, "");

  // Strip attributes from allowed tags.
  out = out
    .replace(/<\s*(p|strong|em|u)\b[^>]*>/gi, "<$1>")
    .replace(/<\s*br\b[^>]*>/gi, "<br>")
    .replace(/<\s*\/\s*(p|strong|em|u)\s*>/gi, "</$1>");

  // If we have no block wrapper, wrap everything in a paragraph.
  const trimmed = out.trim();
  if (!trimmed) return "";

  const startsWithParagraph = /^<\s*p\b/i.test(trimmed);
  if (!startsWithParagraph) {
    return `<p>${trimmed}</p>`;
  }

  // Drop empty paragraphs that can result from aggressive stripping.
  out = out.replace(/<p>\s*<\/p>/gi, "");

  return out.trim();
}
