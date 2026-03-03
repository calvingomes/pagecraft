const ALLOWED_TAGS_REGEX = /<(?!\/?\s*(p|br|strong|em|u)\b)[^>]*>/gi;
const STRIP_ATTRS_REGEX = /<\s*(p|strong|em|u)\b[^>]*>/gi;
const LEADING_BR_REGEX = /^(?:\s*<br>\s*)+/i;
const TRAILING_BR_REGEX = /(?:\s*<br>\s*)+$/i;
const BR_BETWEEN_PARAGRAPHS_REGEX = /<\/p>\s*((?:<br>\s*)+)<p>/gi;
const INLINE_FORMAT_TAGS_REGEX = /<\/?(?:strong|em|u)\s*>/gi;
const BR_TAG_REGEX = /<br\s*>/gi;

/**
 * Checks if a paragraph string contains only whitespace, breaks, or empty tags.
 */
const isEmptyParagraph = (inner: string): boolean => {
  const withoutInlineTags = inner.replace(INLINE_FORMAT_TAGS_REGEX, "");
  const withoutBreaks = withoutInlineTags.replace(BR_TAG_REGEX, "");
  const withoutNbsp = withoutBreaks.replace(/&nbsp;/gi, " ");
  return withoutNbsp.trim().length === 0;
};

/**
 * Allows only: paragraphs + bold/italic/underline.
 */
export function sanitizeMinimalRTH(input: string): string {
  const html = (input ?? "").trim();
  if (!html) return "";

  let out = html
    .replace(/<\s*b\b[^>]*>/gi, "<strong>")
    .replace(/<\s*\/\s*b\s*>/gi, "</strong>")
    .replace(/<\s*i\b[^>]*>/gi, "<em>")
    .replace(/<\s*\/\s*i\s*>/gi, "</em>")
    .replace(ALLOWED_TAGS_REGEX, "")
    .replace(STRIP_ATTRS_REGEX, "<$1>")
    .replace(/<\s*br\b[^>]*>/gi, "<br>")
    .replace(/<\s*\/\s*(p|strong|em|u)\s*>/gi, "</$1>");

  out = out
    .replace(LEADING_BR_REGEX, "")
    .replace(TRAILING_BR_REGEX, "")
    .replace(BR_BETWEEN_PARAGRAPHS_REGEX, (_match, brs: string) => {
      const count = (brs.match(/<br>/gi) ?? []).length;
      return `</p>${"<p><br></p>".repeat(count)}<p>`;
    });

  if (!/^<\s*p\b/i.test(out.trim())) {
    out = `<p>${out}</p>`;
  }

  const paragraphs = Array.from(out.matchAll(/<p>([\s\S]*?)<\/p>/gi)).map((m) =>
    (m[1] ?? "").replace(/\r\n|\r|\n/g, "<br>"),
  );

  if (paragraphs.length === 0) return "";

  let start = 0;
  let end = paragraphs.length - 1;

  while (start <= end && isEmptyParagraph(paragraphs[start]!)) {
    start += 1;
  }

  while (end >= start && isEmptyParagraph(paragraphs[end]!)) {
    end -= 1;
  }

  if (start > end) return "";

  while (start <= end) {
    const next = paragraphs[start]!.replace(LEADING_BR_REGEX, "");
    paragraphs[start] = next;
    if (!isEmptyParagraph(next)) break;
    start += 1;
  }

  while (end >= start) {
    const next = paragraphs[end]!.replace(TRAILING_BR_REGEX, "");
    paragraphs[end] = next;
    if (!isEmptyParagraph(next)) break;
    end -= 1;
  }

  if (start > end) return "";

  const normalized: string[] = [];
  for (let index = start; index <= end; index += 1) {
    const inner = paragraphs[index]!;
    normalized.push(
      isEmptyParagraph(inner) ? "<p><br></p>" : `<p>${inner}</p>`,
    );
  }

  return normalized.join("").trim();
}

/**
 * Flattens paragraphs into a single line for CSS line-clamping safety.
 */
export function minimalRTHtmlToInlineForClamp(input: string): string {
  const safe = sanitizeMinimalRTH(input);
  if (!safe) return "";

  const paragraphs = Array.from(safe.matchAll(/<p>([\s\S]*?)<\/p>/gi)).map(
    (m) => m[1] ?? "",
  );

  return paragraphs.length > 0 ? paragraphs.join("<br>").trim() : safe;
}
