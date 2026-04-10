import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadPageImage, deletePageImage, MAX_TOTAL_UPLOAD_BYTES } from "../pageImageStorage";
import { supabase } from "@/lib/supabase/client";
import type { Mock } from "vitest";

// Mock Supabase - Inlined to avoid Vitest hoisting issues
vi.mock("@/lib/supabase/client", () => {
  const mock = {
    from: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    then: vi.fn(),
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn(),
      remove: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockImplementation(() => ({ data: { publicUrl: "https://example.com/mock.png" } })),
    },
  };

  const chainable = [
    "from",
    "select",
    "insert",
    "upsert",
    "update",
    "delete",
    "eq",
    "in",
    "order",
    "single",
    "maybeSingle",
  ] as const;
  chainable.forEach((method) => {
    mock[method].mockReturnValue(mock);
  });

  return { supabase: mock };
});

type SupabaseStorageMock = {
  upload: Mock;
  remove: Mock;
};
type SupabaseMock = {
  maybeSingle: Mock;
  storage: SupabaseStorageMock;
};
const s = supabase as unknown as SupabaseMock;

describe("pageImageStorage", () => {
  const mockUid = "user-123";
  const mockUsername = "testuser";
  const mockFile = new File(["test data"], "avatar.png", { type: "image/png" });

  beforeEach(() => {
    vi.clearAllMocks();
    // Default quota response
    s.maybeSingle.mockResolvedValue({ data: { storage_bytes_used: 1000 }, error: null });
    s.storage.upload.mockResolvedValue({ data: {}, error: null });
  });

  describe("uploadPageImage", () => {
    it("successfully uploads a valid image within quota", async () => {
      const result = await uploadPageImage({
        uid: mockUid,
        username: mockUsername,
        file: mockFile,
        scope: { kind: "avatar" }
      });

      expect(result.downloadUrl).toBeDefined();
      expect(result.storagePath).toBe(`users/${mockUid}/avatars/avatar.webp`);
      expect(supabase.storage.from).toHaveBeenCalledWith("pagecraft-bucket");
      expect(s.storage.upload).toHaveBeenCalled();
    });

    it("throws error if file type is not allowed", async () => {
      const badFile = new File(["bad"], "test.txt", { type: "text/plain" });
      await expect(uploadPageImage({
        uid: mockUid,
        username: mockUsername,
        file: badFile,
        scope: { kind: "avatar" }
      })).rejects.toThrow("Only .jpg, .jpeg, .png, and .webp images are allowed.");
    });

    it("throws error if total quota exceeded", async () => {
      // Mock usage near limit
      s.maybeSingle.mockResolvedValue({ 
        data: { storage_bytes_used: MAX_TOTAL_UPLOAD_BYTES + 1 }, 
        error: null 
      });

      await expect(uploadPageImage({
        uid: mockUid,
        username: mockUsername,
        file: mockFile,
        scope: { kind: "avatar" }
      })).rejects.toThrow("Total upload limit reached");
    });

    it("calculates projected size correctly with previousSizeBytes", async () => {
      // Current 10MB, Previous 2MB, New 5MB -> 10 - 2 + 5 = 13MB
      s.maybeSingle.mockResolvedValue({ 
        data: { storage_bytes_used: 10 * 1024 * 1024 }, 
        error: null 
      });
      const fiveMbFile = new File([new ArrayBuffer(5 * 1024 * 1024)], "large.png", { type: "image/png" });

      await uploadPageImage({
        uid: mockUid,
        username: mockUsername,
        file: fiveMbFile,
        scope: { kind: "avatar" },
        previousSizeBytes: 2 * 1024 * 1024
      });

      expect(s.storage.upload).toHaveBeenCalled();
    });
  });

  describe("deletePageImage", () => {
    it("calls storage.remove with correct path", async () => {
      const released = await deletePageImage({
        uid: mockUid,
        username: mockUsername,
        scope: { kind: "block-image", blockId: "block-1" },
        previousSizeBytes: 500
      });

      expect(s.storage.remove).toHaveBeenCalledWith([`users/${mockUid}/blocks/block-1.webp`]);
      expect(released).toBe(500);
    });
  });
});
