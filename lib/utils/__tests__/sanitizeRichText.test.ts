import { describe, expect, it } from "vitest";
import {
  minimalRTHtmlToInlineForClamp,
  sanitizeMinimalRTH,
} from "../sanitizeRichText";

describe("sanitizeRichText", () => {
  describe("sanitizeMinimalRTH", () => {
    it("should preserve allowed tags: <p>, <br>, <strong>, <em>, <u>", () => {
      const input = "<p><strong>a</strong><em>b</em><u>c</u><br></p>";
      const output = sanitizeMinimalRTH(input);
      expect(output).toContain("<p>");
      expect(output).toContain("<strong>a</strong>");
      expect(output).toContain("<em>b</em>");
      expect(output).toContain("<u>c</u>");
      expect(output).not.toContain("<script");
    });

    it("should strip disallowed tags like <script>, <div>, <span>", () => {
      const input = "<script>alert(1)</script><div><span>Hi</span></div>";
      expect(sanitizeMinimalRTH(input)).toBe("<p>alert(1)Hi</p>");
    });

    it('should strip attributes from allowed tags (e.g. class="foo" on a <p>)', () => {
      const input = '<p class="x" data-test="y"><strong style="x">Hi</strong></p>';
      expect(sanitizeMinimalRTH(input)).toBe("<p><strong>Hi</strong></p>");
    });

    it("should normalise <b> to <strong>", () => {
      expect(sanitizeMinimalRTH("<p><b>bold</b></p>")).toBe(
        "<p><strong>bold</strong></p>",
      );
    });

    it("should normalise <i> to <em>", () => {
      expect(sanitizeMinimalRTH("<p><i>italic</i></p>")).toBe("<p><em>italic</em></p>");
    });

    it('should return "" for fully empty or whitespace-only input', () => {
      expect(sanitizeMinimalRTH("   ")).toBe("");
      expect(sanitizeMinimalRTH("")).toBe("");
    });

    it("should remove leading empty paragraphs from the result", () => {
      expect(sanitizeMinimalRTH("<p><br></p><p>Title</p>")).toBe("<p>Title</p>");
    });

    it("should remove trailing empty paragraphs from the result", () => {
      expect(sanitizeMinimalRTH("<p>Title</p><p><br></p>")).toBe("<p>Title</p>");
    });

    it("should preserve consecutive interior empty paragraphs as separate <p><br></p> tags", () => {
      expect(sanitizeMinimalRTH("<p>A</p><p><br></p><p><br></p><p>B</p>")).toBe(
        "<p>A</p><p><br></p><p><br></p><p>B</p>",
      );
    });

    it("should preserve a non-empty paragraph between two empty ones", () => {
      expect(sanitizeMinimalRTH("<p><br></p><p>X</p><p><br></p>")).toBe("<p>X</p>");
    });

    it("should not modify content that is already clean", () => {
      const clean = "<p>Hello <strong>World</strong></p>";
      expect(sanitizeMinimalRTH(clean)).toBe(clean);
    });
  });

  describe("minimalRTHtmlToInlineForClamp", () => {
    it("should flatten multiple <p> tags into a single line separated by spaces", () => {
      expect(minimalRTHtmlToInlineForClamp("<p>One</p><p>Two</p>")).toBe("One<br>Two");
    });

    it("should preserve inline formatting like <strong> and <em> within the flat output", () => {
      expect(
        minimalRTHtmlToInlineForClamp("<p><strong>One</strong></p><p><em>Two</em></p>"),
      ).toBe("<strong>One</strong><br><em>Two</em>");
    });

    it("should return empty string for empty input", () => {
      expect(minimalRTHtmlToInlineForClamp("")).toBe("");
    });
  });
});
