import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { saveEditorPage } from "../saveEditorPage";
import type { SaveEditorPageInput } from "../saveEditorPage";
import { supabase } from "@/lib/supabase/client";
import * as storage from "@/lib/uploads/pageImageStorage";
import * as webp from "@/lib/uploads/imageWebp";
import type { Block } from "@/types/editor";

// Mega Proxy: Both a function and an object, always returns itself.
// Includes stable mock functions for reliable assertions.
vi.mock("@/lib/supabase/client", () => {
  type QueryResult = { data: unknown; error: unknown };
  let currentResult: QueryResult = { data: {}, error: null };
  const resultsByTable = new Map<string, QueryResult>();

  const createMockProxy = () => {
    const fn = vi.fn(() => proxy);

    // Stable mocks for frequent assertions
    const fromMock = vi.fn((table) => {
      currentResult = resultsByTable.get(table) || { data: {}, error: null };
      return proxy;
    });

    const proxy = new Proxy(fn, {
      get(target, prop) {
        const targetRecord = target as unknown as Record<string, unknown>;
        if (prop === "then") {
          return (resolve: (value: QueryResult) => unknown) =>
            resolve(currentResult);
        }
        if (prop === "from") {
          return fromMock;
        }
        if (typeof prop === "string" && !targetRecord[prop]) {
          targetRecord[prop] = createMockProxy();
        }
        return targetRecord[String(prop)] || proxy;
      },
    });

    return proxy;
  };

  const finalProxy = createMockProxy();
  const proxyWithSetters = finalProxy as unknown as {
    _setResult: (table: string, result: QueryResult) => void;
    _setDefaultResult: (result: QueryResult) => void;
  };
  proxyWithSetters._setResult = (table, result) =>
    resultsByTable.set(table, result);
  proxyWithSetters._setDefaultResult = (result) => {
    currentResult = result;
  };

  return { supabase: finalProxy };
});

vi.mock("@/lib/uploads/pageImageStorage", () => ({
  uploadPageImage: vi.fn(),
  deletePageImage: vi.fn(),
}));

vi.mock("@/lib/uploads/imageWebp", () => ({
  dataUrlToWebpFile: vi.fn(),
}));

vi.mock("@/lib/uploads/ogGenerator", () => ({
  generateOgImageBlob: vi.fn(),
}));

const asMock = (fn: unknown) => fn as Mock;

describe("saveEditorPage", () => {
  const mockInput: SaveEditorPageInput = {
    userId: "user-123",
    username: "testuser",
    background: "page-bg-1",
    sidebarPosition: "left",
    displayName: "Test User",
    bioHtml: "<p>Hello</p>",
    avatarUrl: "https://example.com/avatar.png",
    persistedAvatarUrl: "https://example.com/avatar.png",
    avatarShape: "circle",
    blocks: [],
    skipOgUpdate: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    const s = supabase as unknown as {
      _setResult: (
        table: string,
        result: { data: unknown; error: unknown },
      ) => void;
      _setDefaultResult: (result: { data: unknown; error: unknown }) => void;
    };
    s._setResult("pages", {
      data: { storage_bytes_used: 1000, updated_at: "2024-01-01" },
      error: null,
    });
    s._setResult("blocks", { data: [], error: null });
    s._setResult("profiles", { data: {}, error: null });
    s._setDefaultResult({ data: {}, error: null });

    asMock(storage.uploadPageImage).mockResolvedValue({
      downloadUrl: "https://example.com/mock.png",
      sizeBytes: 100,
    });
  });

  it("successfully updates profile and page settings", async () => {
    const result = await saveEditorPage(mockInput);

    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(supabase.from).toHaveBeenCalledWith("pages");
    expect(result.updatedAt).toBeDefined();
  });

  it("handles new avatar upload (data URL check)", async () => {
    const dataUrl = "data:image/png;base64,mockdata";
    const input = { ...mockInput, avatarUrl: dataUrl };

    asMock(webp.dataUrlToWebpFile).mockResolvedValue(
      new File([], "avatar.webp"),
    );
    asMock(storage.uploadPageImage).mockResolvedValue({
      downloadUrl: "https://cdn.com/new-avatar.webp",
      sizeBytes: 500,
    });

    const result = await saveEditorPage(input);

    expect(storage.uploadPageImage).toHaveBeenCalled();
    expect(result.avatarUrl).toBe("https://cdn.com/new-avatar.webp");
    // Should verify storage_bytes_used logic (initial 1000 + 500 = 1500)
    expect(
      (supabase as unknown as { update: Mock }).update,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ storage_bytes_used: 1500 }),
    );
  });

  it("correctly packs unified block data (mobile fields into styles JSONB)", async () => {
    const block: Block = {
      id: "b1",
      type: "text",
      order: 0,
      content: { text: "hello" },
      layout: { x: 0, y: 0 },
      mobileLayout: { x: 1, y: 1 },
      mobileStyles: { backgroundColor: "#ff0000" },
      visibility: { mobile: false },
    };

    const input = { ...mockInput, blocks: [block] };

    await saveEditorPage(input);

    expect(
      (supabase as unknown as { upsert: Mock }).upsert,
    ).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: "b1",
          styles: expect.objectContaining({
            mobileLayout: { x: 1, y: 1 },
            mobileStyles: { backgroundColor: "#ff0000" },
            visibility: { mobile: false },
          }),
        }),
      ]),
      expect.any(Object),
    );
  });
});
