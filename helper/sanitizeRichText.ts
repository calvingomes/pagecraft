/**
 * Allows only: paragraphs + bold/italic/underline.
 * Strips all attributes and removes all other tags.
 *
 * Note: This is intentionally strict and isomorphic (no DOMParser).
 */
export function sanitizeMinimalRTH(input: string): string {
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
  // (Keeps count, but never allows leading/trailing blank lines.)
  out = out
    .replace(/^(?:\s*<br>\s*)+/i, "")
    .replace(/(?:\s*<br>\s*)+$/i, "")
    .replace(/<\/p>\s*((?:<br>\s*)+)<p>/gi, (_m, brs: string) => {
      const count = (brs.match(/<br>/gi) ?? []).length;
      return `</p>${"<p><br></p>".repeat(count)}<p>`;
    });

  // If we have no block wrapper, wrap everything in a paragraph.
  const trimmed = out.trim();
  if (!trimmed) return "";

  const startsWithParagraph = /^<\s*p\b/i.test(trimmed);
  if (!startsWithParagraph) {
    out = `<p>${trimmed}</p>`;
  }

  const isEmptyParagraph = (inner: string) => {
    const withoutInlineTags = inner.replace(/<\/?(?:strong|em|u)\s*>/gi, "");
    const withoutBreaks = withoutInlineTags.replace(/<br\s*>/gi, "");
    const withoutNbsp = withoutBreaks.replace(/&nbsp;/gi, " ");
    return withoutNbsp.trim().length === 0;
  };

  // Preserve any number of empty paragraphs between non-empty paragraphs.
  const paragraphs = Array.from(out.matchAll(/<p>([\s\S]*?)<\/p>/gi)).map(
    (m) => m[1] ?? "",
  );

  if (paragraphs.length === 0) return "";

  const withBreaks = paragraphs.map((inner) =>
    inner.replace(/\r\n|\r|\n/g, "<br>"),
  );

  // Trim leading empty paragraphs.
  while (withBreaks.length > 0 && isEmptyParagraph(withBreaks[0]!)) {
    withBreaks.shift();
  }

  // Trim trailing empty paragraphs.
  while (
    withBreaks.length > 0 &&
    isEmptyParagraph(withBreaks[withBreaks.length - 1]!)
  ) {
    withBreaks.pop();
  }

  if (withBreaks.length === 0) return "";

  // Ensure the content doesn't start/end with blank lines caused by <br>.
  // (We only strip <br> at the document edges.)
  while (withBreaks.length > 0) {
    const next = withBreaks[0]!.replace(/^(?:\s*<br>\s*)+/i, "");
    withBreaks[0] = next;
    if (!isEmptyParagraph(withBreaks[0]!)) break;
    withBreaks.shift();
  }

  while (withBreaks.length > 0) {
    const lastIdx = withBreaks.length - 1;
    const next = withBreaks[lastIdx]!.replace(/(?:\s*<br>\s*)+$/i, "");
    withBreaks[lastIdx] = next;
    if (!isEmptyParagraph(withBreaks[lastIdx]!)) break;
    withBreaks.pop();
  }

  if (withBreaks.length === 0) return "";

  return withBreaks
    .map((inner) =>
      isEmptyParagraph(inner) ? "<p><br></p>" : `<p>${inner}</p>`,
    )
    .join("")
    .trim();
}

/**
 * Converts sanitized minimal rich-text HTML from paragraph blocks into a single
 * inline flow using <br> separators.
 *
 * This improves reliability of multi-line clamping ellipsis, since
 * `-webkit-line-clamp` can behave oddly with nested block elements.
 */
export function minimalRTHtmlToInlineForClamp(input: string): string {
  const safe = sanitizeMinimalRTH(input);
  if (!safe) return "";

  const paragraphs = Array.from(safe.matchAll(/<p>([\s\S]*?)<\/p>/gi)).map(
    (m) => m[1] ?? "",
  );

  if (paragraphs.length === 0) return safe;
  return paragraphs.join("<br>").trim();
}
