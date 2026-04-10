import { describe, it, expect } from "vitest";
import { 
  resolveViewportMode, 
  resolveViewportModeFromUA, 
  getEditorViewportCapabilities, 
  getViewEffectiveSidebarPosition 
} from "../viewport";

describe("Viewport Logic", () => {
  describe("resolveViewportMode", () => {
    it("resolves 'mobile' for widths <= 959", () => {
      expect(resolveViewportMode(375)).toBe("mobile");
      expect(resolveViewportMode(959)).toBe("mobile");
    });

    it("resolves 'tablet' for widths between 960 and 1359", () => {
      expect(resolveViewportMode(960)).toBe("tablet");
      expect(resolveViewportMode(1200)).toBe("tablet");
      expect(resolveViewportMode(1359)).toBe("tablet");
    });

    it("resolves 'desktop' for widths >= 1360", () => {
      expect(resolveViewportMode(1360)).toBe("desktop");
      expect(resolveViewportMode(1920)).toBe("desktop");
    });
  });

  describe("resolveViewportModeFromUA", () => {
    it("resolves 'mobile' for mobile user agents", () => {
      expect(resolveViewportModeFromUA("Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X)")).toBe("mobile");
      expect(resolveViewportModeFromUA("Mozilla/5.0 (Android 4.4; Mobile; rv:41.0)")).toBe("mobile");
    });

    it("resolves 'desktop' for others", () => {
      expect(resolveViewportModeFromUA("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("desktop");
    });
  });

  describe("getEditorViewportCapabilities", () => {
    it("disallows manual preview toggle on mobile", () => {
      const caps = getEditorViewportCapabilities("mobile");
      expect(caps.allowManualPreviewToggle).toBe(false);
      expect(caps.defaultPreviewViewport).toBe("mobile");
    });

    it("allows manual preview toggle on tablet/desktop", () => {
      expect(getEditorViewportCapabilities("tablet").allowManualPreviewToggle).toBe(true);
      expect(getEditorViewportCapabilities("desktop").allowManualPreviewToggle).toBe(true);
    });
  });

  describe("getViewEffectiveSidebarPosition", () => {
    it("forces 'center' on mobile and tablet", () => {
      expect(getViewEffectiveSidebarPosition("mobile", "left")).toBe("center");
      expect(getViewEffectiveSidebarPosition("tablet", "right")).toBe("center");
    });

    it("preserves persisted position on desktop", () => {
      expect(getViewEffectiveSidebarPosition("desktop", "left")).toBe("left");
      expect(getViewEffectiveSidebarPosition("desktop", "right")).toBe("right");
    });
  });
});
