import { expect, test } from "@playwright/test";
import { getTestUsername } from "./testUser";

test("should render the public view page for a known username", async ({ page }) => {
  const username = getTestUsername();
  await page.goto(`/${username}`);
  await expect(page).toHaveURL(new RegExp(`/${username}$`));
  await expect(page.locator('[data-is-editor="true"]')).toHaveCount(0);
  await expect(page.locator("main")).toBeVisible();
});

test("should render all visible blocks on the view page", async ({ page }) => {
  const username = getTestUsername();
  await page.goto(`/${username}`);
  await page.waitForTimeout(1000);
  const count = await page.locator('[data-testid="block-item"]').count();
  expect(count).toBeGreaterThan(0);
});

test("should render mobile layout when viewport is narrow", async ({ page }) => {
  const username = getTestUsername();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/${username}`);
  // Wait for client-side viewport detection to hydrate (useViewportMode fires after mount)
  await expect(page.locator('main[data-preview="mobile"]')).toBeVisible({ timeout: 10000 });
});

test("should contain correct og:title meta tag", async ({ page }) => {
  const username = getTestUsername();
  await page.goto(`/${username}`);
  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
  expect(ogTitle).toBeTruthy();
});
