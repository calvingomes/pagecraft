import { describe, it, expect, vi, beforeEach } from "vitest";
import { toWebpFile, dataUrlToWebpFile } from "../imageWebp";
import * as imageProcessing from "../imageProcessing";

// Mock the lower-level processing functions
vi.mock("../imageProcessing", () => ({
  convertFileToWebp: vi.fn().mockImplementation((file, name) => 
    Promise.resolve(new File([file], name, { type: "image/webp" }))
  ),
  dataUrlToFile: vi.fn().mockImplementation((url, name) => 
    new File(["mock"], name, { type: "image/png" })
  ),
  fileToDataUrl: vi.fn().mockResolvedValue("data:image/webp;base64,mock"),
}));

describe("imageWebp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("toWebpFile", () => {
    it("calls convertFileToWebp with injected default options", async () => {
      const file = new File(["test"], "test.png");
      await toWebpFile(file, "out.webp");

      expect(imageProcessing.convertFileToWebp).toHaveBeenCalledWith(
        file, 
        "out.webp", 
        expect.objectContaining({
          maxSizeMB: 2,
          quality: 0.6
        })
      );
    });
  });

  describe("dataUrlToWebpFile", () => {
    it("orchestrates conversion from dataUrl to webp file", async () => {
      const mockDataUrl = "data:image/png;base64,mock";
      const result = await dataUrlToWebpFile(mockDataUrl, "avatar.webp");

      expect(imageProcessing.dataUrlToFile).toHaveBeenCalledWith(mockDataUrl, "avatar.webp");
      expect(imageProcessing.convertFileToWebp).toHaveBeenCalled();
      expect(result.type).toBe("image/webp");
    });
  });
});
