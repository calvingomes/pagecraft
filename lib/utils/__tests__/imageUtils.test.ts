import { describe, expect, it } from "vitest";
import { getCacheBustedUrl } from "../imageUtils";

describe("getCacheBustedUrl", () => {
  it('should append a "?v=" query param to a Supabase storage URL', () => {
    const url = "https://abc.supabase.co/storage/v1/object/public/avatars/me.webp";
    expect(getCacheBustedUrl(url, 123)).toBe(`${url}?v=123`);
  });

  it('should replace an existing query param on a Supabase URL rather than appending a second "?"', () => {
    const url =
      "https://abc.supabase.co/storage/v1/object/public/avatars/me.webp?old=1";
    expect(getCacheBustedUrl(url, 999)).toBe(
      "https://abc.supabase.co/storage/v1/object/public/avatars/me.webp?v=999",
    );
  });

  it('should return the original URL unchanged for a non-Supabase URL like "https://cdn.example.com/img.webp"', () => {
    const url = "https://cdn.example.com/img.webp";
    expect(getCacheBustedUrl(url, 1)).toBe(url);
  });

  it("should return the original URL unchanged for an empty or falsy URL", () => {
    expect(getCacheBustedUrl("", 1)).toBe("");
    expect(getCacheBustedUrl(undefined, 1)).toBe("");
    expect(getCacheBustedUrl(null, 1)).toBe("");
  });

  it("should accept a Date object as the version and use its timestamp", () => {
    const url = "https://abc.supabase.co/storage/v1/object/public/avatars/me.webp";
    const date = new Date("2025-01-01T00:00:00.000Z");
    expect(getCacheBustedUrl(url, date)).toBe(`${url}?v=${date.getTime()}`);
  });

  it("should accept a string as the version", () => {
    const url = "https://abc.supabase.co/storage/v1/object/public/avatars/me.webp";
    expect(getCacheBustedUrl(url, "1700000000000")).toBe(`${url}?v=1700000000000`);
  });

  it("should accept a number as the version", () => {
    const url = "https://abc.supabase.co/storage/v1/object/public/avatars/me.webp";
    expect(getCacheBustedUrl(url, 42)).toBe(`${url}?v=42`);
  });

  it('should correctly identify a URL containing ".supabase.co" as a Supabase URL', () => {
    const url = "https://project.supabase.co/path/image.webp";
    expect(getCacheBustedUrl(url, 7)).toBe(`${url}?v=7`);
  });
});
