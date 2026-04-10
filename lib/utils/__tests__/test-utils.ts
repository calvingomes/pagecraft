import { vi } from "vitest";
import type { Mock } from "vitest";

/**
 * A robust, chainable mock for Supabase client.
 * Supports infinite chaining of common methods like .from().select().eq().in()
 */
export const createSupabaseMock = () => {
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
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn(),
      remove: vi.fn(),
      getPublicUrl: vi
        .fn()
        .mockImplementation(() => ({
          data: { publicUrl: "https://example.com/mock.png" },
        })),
    },
  };

  // Setup fluent chaining: most methods return the mock itself
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
    "match",
    "limit",
    "range",
    "rpc",
  ] as const;

  chainable.forEach((method) => {
    mock[method].mockReturnValue(mock);
  });

  return mock;
};

/**
 * Type-safe mock helper for bun test / vitest compatibility
 */
export const asMock = (fn: unknown) => fn as Mock;
