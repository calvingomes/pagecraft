import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useViewportEditor } from "../useViewportEditor";
import { useEditorStore } from "@/stores/editor-store";

const mockUseEditorViewportPreview = vi.fn();

vi.mock("@/hooks/useEditorViewportPreview", () => ({
  useEditorViewportPreview: () => mockUseEditorViewportPreview(),
}));

const desktop = {
  screenView: "desktop" as const,
  previewView: "desktop" as const,
  setPreviewView: vi.fn(),
  viewportResolved: true,
};

describe("useViewportEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useEditorStore.getState().setIsActualMobile(false);
    useEditorStore.getState().setActiveViewportMode("desktop");
  });

  describe("activeEditorMode derivation", () => {
    it("should be desktop when screen is desktop and preview is desktop", () => {
      mockUseEditorViewportPreview.mockReturnValue(desktop);
      const { result } = renderHook(() => useViewportEditor("left"));
      expect(result.current.activeEditorMode).toBe("desktop");
    });

    it("should be mobile when screen is desktop but preview is mobile", () => {
      mockUseEditorViewportPreview.mockReturnValue({ ...desktop, previewView: "mobile" });
      const { result } = renderHook(() => useViewportEditor("left"));
      expect(result.current.activeEditorMode).toBe("mobile");
    });

    it("should be mobile when screen is mobile (regardless of previewView)", () => {
      mockUseEditorViewportPreview.mockReturnValue({
        ...desktop,
        screenView: "mobile",
        previewView: "mobile",
      });
      const { result } = renderHook(() => useViewportEditor("left"));
      expect(result.current.activeEditorMode).toBe("mobile");
    });

    it("should be tablet when screen is tablet and preview is desktop", () => {
      mockUseEditorViewportPreview.mockReturnValue({
        ...desktop,
        screenView: "tablet",
        previewView: "desktop",
      });
      const { result } = renderHook(() => useViewportEditor("left"));
      expect(result.current.activeEditorMode).toBe("tablet");
    });

    it("should be mobile when screen is tablet but preview is mobile", () => {
      mockUseEditorViewportPreview.mockReturnValue({
        ...desktop,
        screenView: "tablet",
        previewView: "mobile",
      });
      const { result } = renderHook(() => useViewportEditor("left"));
      expect(result.current.activeEditorMode).toBe("mobile");
    });
  });

  describe("activeBlockViewportMode derivation", () => {
    it("should be mobile when previewView is mobile", () => {
      mockUseEditorViewportPreview.mockReturnValue({ ...desktop, previewView: "mobile" });
      const { result } = renderHook(() => useViewportEditor("left"));
      expect(result.current.activeBlockViewportMode).toBe("mobile");
    });

    it("should be desktop when previewView is desktop", () => {
      mockUseEditorViewportPreview.mockReturnValue(desktop);
      const { result } = renderHook(() => useViewportEditor("left"));
      expect(result.current.activeBlockViewportMode).toBe("desktop");
    });
  });

  describe("effectiveSidebarPosition", () => {
    it("should preserve the sidebar position when desktop editing", () => {
      mockUseEditorViewportPreview.mockReturnValue(desktop);
      const { result } = renderHook(() => useViewportEditor("right"));
      expect(result.current.effectiveSidebarPosition).toBe("right");
    });

    it("should force center when editing in mobile preview on desktop screen", () => {
      mockUseEditorViewportPreview.mockReturnValue({ ...desktop, previewView: "mobile" });
      const { result } = renderHook(() => useViewportEditor("right"));
      expect(result.current.effectiveSidebarPosition).toBe("center");
    });

    it("should force center on a tablet screen regardless of sidebar setting", () => {
      mockUseEditorViewportPreview.mockReturnValue({
        ...desktop,
        screenView: "tablet",
        previewView: "desktop",
      });
      const { result } = renderHook(() => useViewportEditor("left"));
      expect(result.current.effectiveSidebarPosition).toBe("center");
    });

    it("should force center on a mobile screen", () => {
      mockUseEditorViewportPreview.mockReturnValue({
        ...desktop,
        screenView: "mobile",
        previewView: "mobile",
      });
      const { result } = renderHook(() => useViewportEditor("right"));
      expect(result.current.effectiveSidebarPosition).toBe("center");
    });
  });

  describe("isActualMobile", () => {
    it("should be true when screenView is mobile", () => {
      mockUseEditorViewportPreview.mockReturnValue({
        ...desktop,
        screenView: "mobile",
        previewView: "mobile",
      });
      const { result } = renderHook(() => useViewportEditor("left"));
      expect(result.current.isActualMobile).toBe(true);
    });

    it("should be false when screenView is desktop", () => {
      mockUseEditorViewportPreview.mockReturnValue(desktop);
      const { result } = renderHook(() => useViewportEditor("left"));
      expect(result.current.isActualMobile).toBe(false);
    });
  });

  describe("store sync side effects", () => {
    it("should sync isActualMobile=true to the store when screen is mobile", async () => {
      mockUseEditorViewportPreview.mockReturnValue({
        ...desktop,
        screenView: "mobile",
        previewView: "mobile",
      });
      renderHook(() => useViewportEditor("left"));
      await act(async () => {});
      expect(useEditorStore.getState().isActualMobile).toBe(true);
    });

    it("should sync isActualMobile=false to the store when screen is desktop", async () => {
      mockUseEditorViewportPreview.mockReturnValue(desktop);
      renderHook(() => useViewportEditor("left"));
      await act(async () => {});
      expect(useEditorStore.getState().isActualMobile).toBe(false);
    });

    it("should sync activeViewportMode=mobile to the store when previewView is mobile", async () => {
      mockUseEditorViewportPreview.mockReturnValue({ ...desktop, previewView: "mobile" });
      renderHook(() => useViewportEditor("left"));
      await act(async () => {});
      expect(useEditorStore.getState().activeViewportMode).toBe("mobile");
    });

    it("should sync activeViewportMode=desktop to the store when previewView is desktop", async () => {
      mockUseEditorViewportPreview.mockReturnValue(desktop);
      renderHook(() => useViewportEditor("left"));
      await act(async () => {});
      expect(useEditorStore.getState().activeViewportMode).toBe("desktop");
    });
  });
});
