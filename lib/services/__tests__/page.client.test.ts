import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { PageService } from "../page.client";
import { supabase } from "@/lib/supabase/client";

// Mock Supabase client - Inlined to avoid Vitest hoisting errors
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
    match: vi.fn(),
    limit: vi.fn(),
    range: vi.fn(),
    then: vi.fn(),
    rpc: vi.fn(),
  };

  const chainable = ["from", "select", "insert", "upsert", "update", "delete", "eq", "in", "order", "match", "limit", "range", "rpc"] as const;
  chainable.forEach(method => {
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
  match: Mock;
  limit: Mock;
  range: Mock;
  then: Mock;
  rpc: Mock;
};
const asMock = (fn: unknown) => fn as Mock;
const s = supabase as unknown as SupabaseMock;

describe("PageService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkUsernameAvailability", () => {
    it("returns false for reserved usernames", async () => {
      const result = await PageService.checkUsernameAvailability("admin");
      expect(result).toBe(false);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("returns false if username is already in the database", async () => {
      asMock(s.maybeSingle).mockResolvedValue({ data: { username: "taken" }, error: null });

      const result = await PageService.checkUsernameAvailability("taken");
      expect(result).toBe(false);
      expect(supabase.from).toHaveBeenCalledWith("usernames");
    });

    it("returns true if username is available", async () => {
      asMock(s.maybeSingle).mockResolvedValue({ data: null, error: null });

      const result = await PageService.checkUsernameAvailability("available");
      expect(result).toBe(true);
    });
  });

  describe("claimUsername", () => {
    const mockUser = "user-123";
    const mockUsername = "new-user";

    it("executes the 3-step claim process successfully", async () => {
      asMock(s.insert).mockResolvedValue({ error: null });
      asMock(s.upsert).mockResolvedValue({ error: null });

      await PageService.claimUsername(mockUsername, mockUser);

      // 1. Insert into usernames
      expect(supabase.from).toHaveBeenCalledWith("usernames");
      expect(s.insert).toHaveBeenCalledWith({ username: mockUsername, uid: mockUser });

      // 2. Upsert profile
      expect(supabase.from).toHaveBeenCalledWith("profiles");
      expect(s.upsert).toHaveBeenCalledWith(
        { id: mockUser, username: mockUsername },
        { onConflict: "id" }
      );

      // 3. Upsert page
      expect(supabase.from).toHaveBeenCalledWith("pages");
      expect(s.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ username: mockUsername, uid: mockUser }),
        { onConflict: "username" }
      );
    });

    it("throws error if any step fails", async () => {
      const error = { message: "DB Error" };
      asMock(s.insert).mockResolvedValue({ error });

      await expect(PageService.claimUsername(mockUsername, mockUser)).rejects.toEqual(error);
    });

    it("throws error for reserved usernames", async () => {
      await expect(PageService.claimUsername("help", mockUser)).rejects.toThrow("reserved");
    });
  });
});
