import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { BlockService } from "../block.client";
import { supabase } from "@/lib/supabase/client";

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
  ] as const;
  chainable.forEach((method) => {
    mock[method].mockReturnValue(mock);
  });

  return { supabase: mock };
});

type SupabaseMock = {
  from: Mock;
  select: Mock;
  insert: Mock;
  upsert: Mock;
  update: Mock;
  delete: Mock;
  eq: Mock;
  in: Mock;
  order: Mock;
  single: Mock;
  maybeSingle: Mock;
  then: Mock;
};
const asMock = (fn: unknown) => fn as Mock;
const s = supabase as unknown as SupabaseMock;

describe("BlockService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBlocksForPage", () => {
    it("fetches blocks and normalizes them", async () => {
      const mockRows = [
        {
          id: 1,
          type: "text",
          order: 0,
          content: { text: "hello" },
          layout: { x: 0, y: 0 },
          styles: {},
        },
      ];
      asMock(s.order).mockResolvedValue({ data: mockRows, error: null });

      const blocks = await BlockService.getBlocksForPage("testuser");

      expect(blocks).toHaveLength(1);
      expect(blocks[0].id).toBe("1");
      expect(blocks[0].type).toBe("text");
      expect(supabase.from).toHaveBeenCalledWith("blocks");
      expect(s.eq).toHaveBeenCalledWith("page_username", "testuser");
    });
  });

  describe("createStarterBlocks", () => {
    it("inserts starter blocks for a new user", async () => {
      asMock(s.insert).mockResolvedValue({ error: null });

      await BlockService.createStarterBlocks("testuser", "user-123");

      expect(supabase.from).toHaveBeenCalledWith("blocks");
      expect(s.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ page_username: "testuser", type: "text" }),
          expect.objectContaining({ page_username: "testuser", type: "link" }),
        ]),
      );
    });

    it("throws error if insert fails", async () => {
      asMock(s.insert).mockResolvedValue({
        error: { message: "insert failed" },
      });

      await expect(
        BlockService.createStarterBlocks("test", "id"),
      ).rejects.toEqual({ message: "insert failed" });
    });
  });
});
