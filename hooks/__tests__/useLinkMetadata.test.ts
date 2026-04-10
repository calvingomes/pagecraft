import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useLinkMetadata } from "../useLinkMetadata";

describe("useLinkMetadata", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = fetchMock;
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should not fetch if not enabled", () => {
    renderHook(() => useLinkMetadata({
      url: "https://google.com",
      enabled: false,
      onSuccess: vi.fn()
    }));

    vi.advanceTimersByTime(1000);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should fetch after debounce if enabled", async () => {
    const onSuccess = vi.fn();
    const mockMeta = { title: "Google", description: "Search" };
    
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockMeta), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    renderHook(() => useLinkMetadata({
      url: "https://google.com",
      enabled: true,
      onSuccess
    }));

    expect(global.fetch).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/link-metadata?url=https%3A%2F%2Fgoogle.com");
    expect(onSuccess).toHaveBeenCalledWith(mockMeta);
  });

  it("should not refetch same URL", async () => {
    const onSuccess = vi.fn();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { rerender } = renderHook(({ url }) => useLinkMetadata({
      url,
      enabled: true,
      onSuccess
    }), {
      initialProps: { url: "https://google.com" }
    });

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Rerender with same URL
    rerender({ url: "https://google.com" });
    
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1
  });
});
