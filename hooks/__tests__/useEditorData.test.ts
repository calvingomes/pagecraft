import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useEditorData } from "../useEditorData";
import { PageService } from "@/lib/services/page.client";
import type { PageData } from "@/lib/services/page.client";
import { BlockService } from "@/lib/services/block.client";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthStore } from "@/types/auth";
import { useEditorStore } from "@/stores/editor-store";
import type { Block, EditorState } from "@/types/editor";
import type { PageBackgroundId, SidebarPosition, AvatarShape } from "@/types/page";
import { ensureBlocksHaveValidLayoutsForAllViewports } from "@/lib/editor-engine/data/normalization";

// Mock Services
vi.mock("@/lib/services/page.client", () => ({
  PageService: {
    getPageByUsername: vi.fn(),
    claimUsername: vi.fn(),
  },
}));

vi.mock("@/lib/services/block.client", () => ({
  BlockService: {
    getBlocksForPage: vi.fn(),
    createStarterBlocks: vi.fn(),
  },
}));

// Mock Stores
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/stores/editor-store", () => ({
  useEditorStore: vi.fn(),
}));

// Mock posthog-js
vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({
    capture: vi.fn(),
  }),
}));

// Mock crypto
if (typeof (globalThis as Record<string, unknown>).crypto === 'undefined') {
  (globalThis as Record<string, unknown>).crypto = {
    randomUUID: (): string => 'test-uuid',
  };
}

describe("useEditorData.ts", () => {
  const mockSetBlocks = vi.fn();
  const mockUser = { id: "user-123" };
  const mockUsername = "testuser";

  const authState = {
    user: mockUser,
    username: mockUsername,
    loading: false,
  };

  const editorState = {
    blocks: [],
    setAllBlocks: mockSetBlocks,
    updateBlock: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Auth Store — hook calls useAuthStore() with no selector
    vi.mocked(useAuthStore).mockReturnValue(authState as unknown as AuthStore);

    // Mock Editor Store — hook calls useEditorStore(selector)
    vi.mocked(useEditorStore).mockImplementation(
      ((selector?: (state: EditorState) => unknown) =>
        selector ? selector(editorState as unknown as EditorState) : editorState
      ) as unknown as typeof useEditorStore
    );
  });

  it("should load data normally when page exists", async () => {
    const mockPage = {
      display_name: "Test User",
      background: "page-bg-1" as PageBackgroundId,
      sidebar_position: "left" as SidebarPosition,
      avatar_url: undefined,
      avatar_shape: "circle" as AvatarShape,
      bio_html: "",
      updated_at: new Date().toISOString(),
    };
    const mockBlocks = [{ id: "1", type: "text", content: { text: "Hello" } }];

    vi.mocked(PageService.getPageByUsername).mockResolvedValue(mockPage as PageData);
    vi.mocked(BlockService.getBlocksForPage).mockResolvedValue(mockBlocks as Block[]);

    renderHook(() => useEditorData());

    await waitFor(() => {
      expect(PageService.getPageByUsername).toHaveBeenCalledWith(mockUsername);
    });

    await waitFor(() => {
      expect(mockSetBlocks).toHaveBeenCalledWith(
        ensureBlocksHaveValidLayoutsForAllViewports(mockBlocks as never),
      );
    });
    
    // Self-healing should NOT be triggered
    expect(PageService.claimUsername).not.toHaveBeenCalled();
  });

  it("should trigger self-healing when page data is missing but user is logged in", async () => {
    const mockPageAfterHealing = {
      display_name: mockUsername,
      background: "page-bg-1" as PageBackgroundId,
      sidebar_position: "left" as SidebarPosition,
      avatar_url: undefined,
      avatar_shape: "circle" as AvatarShape,
      bio_html: "",
      updated_at: new Date().toISOString(),
    };

    // First call returns null, second call (after healing) returns data
    vi.mocked(PageService.getPageByUsername)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockPageAfterHealing);
    
    vi.mocked(BlockService.getBlocksForPage).mockResolvedValue([]);

    renderHook(() => useEditorData());

    await waitFor(() => {
      // Should attempt to claim username
      expect(PageService.claimUsername).toHaveBeenCalledWith(mockUsername, mockUser.id);
      // Should create starter blocks
      expect(BlockService.createStarterBlocks).toHaveBeenCalledWith(mockUsername, mockUser.id);
      // Should re-fetch page data after self-healing
      expect(PageService.getPageByUsername).toHaveBeenCalledTimes(2);
      // And load blocks to store
      expect(mockSetBlocks).toHaveBeenCalled();
    });
  });

  it("should handle self-healing failures gracefully", async () => {
    vi.mocked(PageService.getPageByUsername).mockResolvedValue(null);
    vi.mocked(PageService.claimUsername).mockRejectedValue(new Error("Claim failed"));
    vi.mocked(BlockService.getBlocksForPage).mockResolvedValue([]);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderHook(() => useEditorData());

    await waitFor(() => {
      expect(PageService.claimUsername).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Self-healing failed"), expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });
});
