import { expect, test } from "@playwright/test";

test("should redirect unauthenticated user from /editor to /auth", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await ctx.newPage();
  await page.goto("/editor");
  await expect(page).toHaveURL(/\/auth/, { timeout: 10000 });
  await ctx.close();
});

test("should load the editor with authenticated session", async ({ page }) => {
  await page.goto("/editor");
  await expect(page.locator('[data-is-editor="true"]')).toBeVisible({ timeout: 10000 });
  await expect(page).toHaveURL(/\/editor/);
});

test("should display the block canvas after editor loads", async ({ page }) => {
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  await expect(page.locator(".react-grid-layout")).toBeVisible();
});

test("should display the user profile sidebar", async ({ page }) => {
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  await expect(page.locator("aside").first()).toBeVisible();
});
