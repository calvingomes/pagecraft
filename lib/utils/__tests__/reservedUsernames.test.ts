import { describe, it, expect } from "vitest";
import { isReservedUsername } from "../reservedUsernames";

describe("reservedUsernames utility", () => {
  it("should return true for exact matches of reserved words", () => {
    expect(isReservedUsername("auth")).toBe(true);
    expect(isReservedUsername("api")).toBe(true);
    expect(isReservedUsername("editor")).toBe(true);
    expect(isReservedUsername("admin")).toBe(true);
  });

  it("should be case-insensitive", () => {
    expect(isReservedUsername("Auth")).toBe(true);
    expect(isReservedUsername("API")).toBe(true);
    expect(isReservedUsername("eDiToR")).toBe(true);
  });

  it("should handle whitespace", () => {
    expect(isReservedUsername("  auth  ")).toBe(true);
    expect(isReservedUsername("\tapi\n")).toBe(true);
  });

  it("should return false for non-reserved words", () => {
    expect(isReservedUsername("calvin")).toBe(false);
    expect(isReservedUsername("my-awesome-profile")).toBe(false);
    expect(isReservedUsername("not-admin")).toBe(false);
  });

  it("should return false for empty or null input", () => {
    expect(isReservedUsername("")).toBe(false);
    // @ts-expect-error - testing null input which is not allowed by types
    expect(isReservedUsername(null)).toBe(false);
  });

  it("should protect platform-specific legal paths", () => {
    expect(isReservedUsername("privacy-policy")).toBe(true);
    expect(isReservedUsername("terms")).toBe(true);
    expect(isReservedUsername("cookie-policy")).toBe(true);
  });
});
