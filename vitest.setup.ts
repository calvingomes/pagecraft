import { vi } from "vitest";
import "@testing-library/jest-dom";

// Inject dummy environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY = "test-key";

/**
 * A Bulletproof Proxy-based Mock for Supabase Queries.
 * It intercepts all property accesses and returns a mock function that returns the proxy itself.
 * This allows infinite chaining like .from().select().eq().upsert().select()
 */
export const createSupabaseChainMock = () => {
  type MockFn = ReturnType<typeof vi.fn>;
  type MockTarget = Record<string | symbol, MockFn>;
  const handler: ProxyHandler<MockTarget> = {
    get(target, prop) {
      // Return a mock function for any property access
      if (!target[prop]) {
        target[prop] = vi.fn().mockReturnValue(proxy);
      }
      return target[prop];
    },
  };

  const target: MockTarget = {};
  const proxy = new Proxy(target, handler);
  return proxy;
};

// Common mock implementation for use across tests if needed
export const globalSupabaseMock = createSupabaseChainMock();
