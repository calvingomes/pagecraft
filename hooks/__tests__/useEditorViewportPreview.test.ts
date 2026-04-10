import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEditorViewportPreview } from "../useEditorViewportPreview";

const mockUseViewportMode = vi.fn();

vi.mock("@/hooks/useViewportMode", () => ({
  useViewportMode: () => mockUseViewportMode(),
}));

describe("useEditorViewportPreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should default preview to desktop when screen is desktop", () => {
    mockUseViewportMode.mockReturnValue({
      viewportMode: "desktop",
      isResolved: true,
    });

    const { result } = renderHook(() => useEditorViewportPreview());
    expect(result.current.previewView).toBe("desktop");
  });

  it("should default preview to mobile when screen is mobile and disallow toggling", () => {
    mockUseViewportMode.mockReturnValue({
      viewportMode: "mobile",
      isResolved: true,
    });

    const { result } = renderHook(() => useEditorViewportPreview());
    expect(result.current.previewView).toBe("mobile");
    expect(result.current.canTogglePreview).toBe(false);

    act(() => {
      result.current.setPreviewView("desktop");
    });
    expect(result.current.previewView).toBe("mobile");
  });

  it("should allow setPreviewView to override the preview on desktop", () => {
    mockUseViewportMode.mockReturnValue({
      viewportMode: "desktop",
      isResolved: true,
    });

    const { result } = renderHook(() => useEditorViewportPreview());
    act(() => {
      result.current.setPreviewView("mobile");
    });
    expect(result.current.previewView).toBe("mobile");
  });

  it("should report isOverrideActive as true after setPreviewView is called", () => {
    mockUseViewportMode.mockReturnValue({
      viewportMode: "desktop",
      isResolved: true,
    });

    const { result } = renderHook(() => useEditorViewportPreview());
    act(() => {
      result.current.setPreviewView("mobile");
    });
    expect(result.current.isOverrideActive).toBe(true);
  });

  it("should report isOverrideActive as false after clearPreviewOverride is called", () => {
    mockUseViewportMode.mockReturnValue({
      viewportMode: "desktop",
      isResolved: true,
    });

    const { result } = renderHook(() => useEditorViewportPreview());
    act(() => {
      result.current.setPreviewView("mobile");
    });
    act(() => {
      result.current.clearPreviewOverride();
    });
    expect(result.current.isOverrideActive).toBe(false);
  });

  it("should return canTogglePreview=false when screen is mobile", () => {
    mockUseViewportMode.mockReturnValue({
      viewportMode: "mobile",
      isResolved: true,
    });

    const { result } = renderHook(() => useEditorViewportPreview());
    expect(result.current.canTogglePreview).toBe(false);
  });

  it("should return canTogglePreview=true when screen is desktop", () => {
    mockUseViewportMode.mockReturnValue({
      viewportMode: "desktop",
      isResolved: true,
    });

    const { result } = renderHook(() => useEditorViewportPreview());
    expect(result.current.canTogglePreview).toBe(true);
  });

  it("should revert to auto-preview after clearPreviewOverride is called", () => {
    mockUseViewportMode.mockReturnValue({
      viewportMode: "desktop",
      isResolved: true,
    });

    const { result } = renderHook(() => useEditorViewportPreview());
    act(() => {
      result.current.setPreviewView("mobile");
    });
    expect(result.current.previewView).toBe("mobile");
    act(() => {
      result.current.clearPreviewOverride();
    });
    expect(result.current.previewView).toBe("desktop");
  });
});
