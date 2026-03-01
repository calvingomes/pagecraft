import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";

type Metadata = {
  title: string | null;
  imageUrl: string | null;
  iconUrl: string | null;
};

function absUrl(base: string, maybeRelative: string | null | undefined) {
  if (!maybeRelative) return null;
  const trimmed = maybeRelative.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed, base).toString();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get("url");
  if (!urlParam) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(urlParam);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return NextResponse.json(
      { error: "Only http(s) urls are allowed" },
      { status: 400 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(target.toString(), {
      signal: controller.signal,
      headers: {
        // Some sites block default fetch user agents
        "user-agent":
          "Mozilla/5.0 (compatible; PagecraftBot/1.0; +https://pagecraft)",
        accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${res.status}` },
        { status: 502 },
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "URL did not return HTML" },
        { status: 415 },
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const ogTitle = $("meta[property='og:title']").attr("content")?.trim();
    const docTitle = $("title").first().text().trim();
    const title = (ogTitle || docTitle || "").trim() || null;

    const ogImage = $("meta[property='og:image']").attr("content")?.trim();
    const twitterImage = $("meta[name='twitter:image']")
      .attr("content")
      ?.trim();
    const imageUrl = absUrl(target.toString(), ogImage || twitterImage);

    // Try common icon rels
    const iconHref =
      $("link[rel~='icon']").first().attr("href")?.trim() ||
      $("link[rel='apple-touch-icon']").first().attr("href")?.trim() ||
      $("link[rel='shortcut icon']").first().attr("href")?.trim();
    const iconUrl = absUrl(target.toString(), iconHref);

    const payload: Metadata = {
      title,
      imageUrl,
      iconUrl,
    };

    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}
