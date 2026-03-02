export function htmlToText(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";

  // If called during SSR (or any non-DOM environment), fall back to a simple
  // tag-stripper. Client-side uses DOM parsing for better entity handling.
  if (typeof window === "undefined" || typeof document === "undefined") {
    return trimmed
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const el = document.createElement("div");
  el.innerHTML = trimmed;
  return (el.textContent ?? "").replace(/\s+/g, " ").trim();
}
