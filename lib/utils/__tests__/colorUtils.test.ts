import { describe, expect, it } from "vitest";
import { deriveTextColor } from "../colorUtils";

describe("deriveTextColor", () => {
  it('should return "var(--color-black)" for a white hex background "#ffffff"', () => {
    expect(deriveTextColor("#ffffff")).toBe("var(--color-black)");
  });

  it('should return "var(--color-black)" for light backgrounds like "#f3f4f6"', () => {
    expect(deriveTextColor("#f3f4f6")).toBe("var(--color-black)");
  });

  it('should return "var(--color-white)" for dark backgrounds like "#000000"', () => {
    expect(deriveTextColor("#000000")).toBe("var(--color-white)");
  });

  it('should return "var(--color-white)" for mid-dark backgrounds like "#3b82f6" (blue)', () => {
    expect(deriveTextColor("#3b82f6")).toBe("var(--color-white)");
  });

  it('should return "var(--color-black)" for light CSS variable "var(--color-block-bg-white)"', () => {
    expect(deriveTextColor("var(--color-block-bg-white)")).toBe("var(--color-black)");
  });

  it('should return "var(--color-white)" for dark CSS variable "var(--color-block-bg-black)"', () => {
    expect(deriveTextColor("var(--color-block-bg-black)")).toBe("var(--color-white)");
  });

  it('should return "var(--color-white)" for "var(--color-block-bg-indigo)"', () => {
    expect(deriveTextColor("var(--color-block-bg-indigo)")).toBe("var(--color-white)");
  });

  it('should return "var(--color-black)" for "var(--color-block-bg-yellow)" (very light)', () => {
    expect(deriveTextColor("var(--color-block-bg-yellow)")).toBe("var(--color-black)");
  });

  it('should return "var(--color-black)" as a safe fallback for an unrecognised CSS variable', () => {
    expect(deriveTextColor("var(--not-a-real-color)")).toBe("var(--color-black)");
  });

  it('should return "var(--color-black)" as a safe fallback for a malformed hex like "#gg0000"', () => {
    expect(deriveTextColor("#gg0000")).toBe("var(--color-black)");
  });

  it('should handle hex without "#" prefix if passed accidentally', () => {
    expect(deriveTextColor("ffffff")).toBe("var(--color-black)");
  });
});
