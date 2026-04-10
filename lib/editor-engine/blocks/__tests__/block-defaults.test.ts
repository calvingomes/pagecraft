import { describe, expect, it } from "vitest";
import { getDefaultContent } from "../block-defaults";

describe("getDefaultContent", () => {
  it('should return { text: "" } for type "text"', () => {
    expect(getDefaultContent("text")).toEqual({ text: "" });
  });

  it('should return { url: "", title: "" } for type "link" with no options', () => {
    expect(getDefaultContent("link")).toEqual({ url: "", title: "" });
  });

  it("should return a link block using provided url and title options", () => {
    expect(
      getDefaultContent("link", {
        url: "https://example.com",
        title: "Example",
      }),
    ).toEqual({
      url: "https://example.com",
      title: "Example",
    });
  });

  it('should return { url: "", alt: "" } for type "image" with no options', () => {
    expect(getDefaultContent("image")).toEqual({ url: "", alt: "" });
  });

  it('should return { title: "" } for type "sectionTitle"', () => {
    expect(getDefaultContent("sectionTitle")).toEqual({ title: "" });
  });
});
