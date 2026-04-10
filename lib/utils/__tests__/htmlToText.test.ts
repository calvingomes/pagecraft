import { describe, expect, it } from "vitest";
import { htmlToText } from "../htmlToText";

describe("htmlToText", () => {
  it("should strip all HTML tags and return plain text", () => {
    expect(htmlToText("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
  });

  it('should decode HTML entities like "&amp;" -> "&" and "&lt;" -> "<"', () => {
    expect(htmlToText("<p>a &amp; b &lt; c</p>")).toBe("a & b < c");
  });

  it("should collapse multiple whitespace characters into a single space", () => {
    expect(htmlToText("<p>Hello     world</p>\n\n<div>again</div>")).toBe(
      "Hello world again",
    );
  });

  it("should trim leading and trailing whitespace from the result", () => {
    expect(htmlToText("   <p> Hello </p>   ")).toBe("Hello");
  });

  it("should return an empty string for empty input", () => {
    expect(htmlToText("")).toBe("");
  });

  it("should return an empty string for null or undefined input", () => {
    expect(htmlToText(null)).toBe("");
    expect(htmlToText(undefined)).toBe("");
  });

  it("should return an empty string for a string that is only HTML tags with no text", () => {
    expect(htmlToText("<p><br></p><div></div>")).toBe("");
  });

  it('should handle nested tags like "<p><strong>bold</strong></p>" -> "bold"', () => {
    expect(htmlToText("<p><strong>bold</strong></p>")).toBe("bold");
  });

  it('should handle self-closing tags like "<br/>" without throwing', () => {
    expect(htmlToText("<br/>Hello<br/>")).toBe("Hello");
  });
});
