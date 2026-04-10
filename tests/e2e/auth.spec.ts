import { test, expect } from "@playwright/test";

test("should bypass login and reach the editor", async ({ page }) => {
  // Navigate to the editor page directly
  await page.goto("/editor");

  // Since we have the session in localStorage, middleware/auth guard should let us in
  // We check for something that only an authenticated user would see, e.g., the canvas or a specific button
  // Wait for the editor UI to load
  await page.waitForSelector('[data-is-editor="true"]', { timeout: 10000 });

  // URL should still be /editor (or /editor/[something])
  expect(page.url()).toContain("/editor");

  // Verify that we are not redirected to /auth
  expect(page.url()).not.toContain("/auth");
});

test("should not expose any editor UI elements to unauthenticated users", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await ctx.newPage();
  await page.goto("/editor");
  await expect(page.locator('[data-is-editor="true"]')).toHaveCount(0);
  await ctx.close();
});
