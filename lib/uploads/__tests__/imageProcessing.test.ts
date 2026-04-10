import { describe, it, expect, vi, beforeEach } from "vitest";
import { dataUrlToFile, convertFileToWebp } from "../imageProcessing";
import imageCompression from "browser-image-compression";

// Mock browser-image-compression
vi.mock("browser-image-compression", () => ({
  default: vi.fn().mockImplementation((file) => Promise.resolve(file)),
}));

describe("imageProcessing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("dataUrlToFile", () => {
    it("converts a valid data URL into a File object", () => {
      const mockDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
      const file = dataUrlToFile(mockDataUrl, "test.png");

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe("test.png");
      expect(file.type).toBe("image/png");
      expect(file.size).toBeGreaterThan(0);
    });

    it("throws error for invalid data URL", () => {
      expect(() => dataUrlToFile("invalid-url", "test.png")).toThrow("Invalid image data URL");
    });
  });

  describe("convertFileToWebp", () => {
    it("calls imageCompression with correct options and returns a webp File", async () => {
      const inputFile = new File(["test"], "test.png", { type: "image/png" });
      const result = await convertFileToWebp(inputFile, "final.webp", { quality: 0.8 });

      expect(imageCompression).toHaveBeenCalledWith(inputFile, expect.objectContaining({
        fileType: "image/webp",
        initialQuality: 0.8
      }));
      expect(result.name).toBe("final.webp");
      expect(result.type).toBe("image/webp");
    });
  });
});
