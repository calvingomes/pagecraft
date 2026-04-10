import { describe, expect, it } from "vitest";
import {
  getLinkHostOrUrl,
  isSupportedLinkUrl,
  normalizeLinkUrl,
  resolveLinkTitle,
  shouldAutoApplyFetchedTitle,
} from "../linkBlock";

describe("linkBlock utils", () => {
  describe("isSupportedLinkUrl", () => {
    it('should return true for a bare domain like "example.com"', () => {
      expect(isSupportedLinkUrl("example.com")).toBe(true);
    });

    it('should return true for "https://example.com"', () => {
      expect(isSupportedLinkUrl("https://example.com")).toBe(true);
    });

    it('should return true for "http://www.example.com"', () => {
      expect(isSupportedLinkUrl("http://www.example.com")).toBe(true);
    });

    it('should return true for a URL with a path like "example.com/path/to/page"', () => {
      expect(isSupportedLinkUrl("example.com/path/to/page")).toBe(true);
    });

    it('should return true for subdomains like "sub.example.co.uk"', () => {
      expect(isSupportedLinkUrl("sub.example.co.uk")).toBe(true);
    });

    it("should return false for an empty string", () => {
      expect(isSupportedLinkUrl("")).toBe(false);
    });

    it('should return false for a plain word with no TLD like "hello"', () => {
      expect(isSupportedLinkUrl("hello")).toBe(false);
    });

    it("should return false for a string with only spaces", () => {
      expect(isSupportedLinkUrl("    ")).toBe(false);
    });

    it("should return true for a URL with trailing whitespace (trimmed internally)", () => {
      expect(isSupportedLinkUrl("example.com   ")).toBe(true);
    });
  });

  describe("normalizeLinkUrl", () => {
    it('should prepend "https://" to a bare domain', () => {
      expect(normalizeLinkUrl("example.com")).toBe("https://example.com");
    });

    it('should not modify a URL already starting with "https://"', () => {
      expect(normalizeLinkUrl("https://example.com")).toBe("https://example.com");
    });

    it('should not modify a URL already starting with "http://"', () => {
      expect(normalizeLinkUrl("http://example.com")).toBe("http://example.com");
    });

    it("should trim whitespace before prepending", () => {
      expect(normalizeLinkUrl("  example.com/path  ")).toBe(
        "https://example.com/path",
      );
    });
  });

  describe("getLinkHostOrUrl", () => {
    it('should return the host for a valid URL like "https://example.com/page"', () => {
      expect(getLinkHostOrUrl("https://example.com/page")).toBe("example.com");
    });

    it("should return the original string if URL parsing throws", () => {
      expect(getLinkHostOrUrl("%%%%")).toBe("%%%%");
    });

    it("should handle a bare string with no protocol gracefully", () => {
      expect(getLinkHostOrUrl("example.com/path")).toBe("example.com/path");
    });
  });

  describe("resolveLinkTitle", () => {
    it("should return the title if present", () => {
      expect(
        resolveLinkTitle({ title: "My Title", metaTitle: "Meta", url: "" }),
      ).toBe("My Title");
    });

    it("should fall back to metaTitle when title is undefined", () => {
      expect(resolveLinkTitle({ metaTitle: "Meta Only", url: "" })).toBe(
        "Meta Only",
      );
    });

    it("should return empty string when both title and metaTitle are absent", () => {
      expect(resolveLinkTitle({ url: "" })).toBe("");
    });
  });

  describe("shouldAutoApplyFetchedTitle", () => {
    it("should return true when the title is empty - auto-apply is safe", () => {
      expect(shouldAutoApplyFetchedTitle({ currentTitle: "" })).toBe(true);
    });

    it("should return true when the title equals the previous metaTitle - user has not edited it", () => {
      expect(
        shouldAutoApplyFetchedTitle({
          currentTitle: "<p>Example</p>",
          currentMetaTitle: "Example",
        }),
      ).toBe(true);
    });

    it("should return false when the user has edited the title beyond the metaTitle", () => {
      expect(
        shouldAutoApplyFetchedTitle({
          currentTitle: "<p>Example custom</p>",
          currentMetaTitle: "Example",
        }),
      ).toBe(false);
    });

    it("should return false when title is a non-empty string different from metaTitle", () => {
      expect(
        shouldAutoApplyFetchedTitle({
          currentTitle: "Different",
          currentMetaTitle: "Original",
        }),
      ).toBe(false);
    });

    it("should return true when currentTitle is undefined or null", () => {
      expect(shouldAutoApplyFetchedTitle({ currentTitle: undefined })).toBe(true);
      expect(shouldAutoApplyFetchedTitle({ currentTitle: null as unknown as string })).toBe(
        true,
      );
    });
  });
});
