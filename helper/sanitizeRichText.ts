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

  // Normalize top-level <br> usage into empty paragraphs.
  out = out
    .replace(/^(?:\s*<br>\s*)+/i, "")
    .replace(/(?:\s*<br>\s*)+$/i, "")
    .replace(/<\/p>\s*(?:<br>\s*)+<p>/gi, "</p><p></p><p>");

  // If we have no block wrapper, wrap everything in a paragraph.
  const trimmed = out.trim();
  if (!trimmed) return "";

  const startsWithParagraph = /^<\s*p\b/i.test(trimmed);
  if (!startsWithParagraph) {
    return `<p>${trimmed}</p>`;
  }

  const isEmptyParagraph = (inner: string) => {
    const withoutInlineTags = inner.replace(/<\/?(?:strong|em|u)\s*>/gi, "");
    const withoutBreaks = withoutInlineTags.replace(/<br\s*>/gi, "");
    const withoutNbsp = withoutBreaks.replace(/&nbsp;/gi, " ");
    return withoutNbsp.trim().length === 0;
  };

  // Keep at most one empty paragraph between non-empty paragraphs.
  const paragraphs = Array.from(out.matchAll(/<p>([\s\S]*?)<\/p>/gi)).map(
    (m) => m[1] ?? "",
  );

  if (paragraphs.length === 0) return "";

  const normalized: string[] = [];
  let previousWasEmpty = false;

  for (const inner of paragraphs) {
    const empty = isEmptyParagraph(inner);

    if (empty) {
      if (normalized.length === 0) continue;
      if (previousWasEmpty) continue;
      previousWasEmpty = true;
      normalized.push("<p></p>");
      continue;
    }

    previousWasEmpty = false;
    normalized.push(`<p>${inner}</p>`);
  }

  while (
    normalized.length > 0 &&
    normalized[normalized.length - 1] === "<p></p>"
  ) {
    normalized.pop();
  }

  return normalized.join("").trim();
}
