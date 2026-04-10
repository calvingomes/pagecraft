import { expect, test } from "@playwright/test";

const unknown = "/this-username-definitely-does-not-exist-xyzabc123";

test("should show the profile not-found page for an unknown username", async ({ page }) => {
  const response = await page.goto(unknown);
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("link", { name: /claim/i })).toBeVisible();
});

test("should not show editor chrome on the 404 page", async ({ page }) => {
  await page.goto(unknown);
  await expect(page.locator('[data-is-editor="true"]')).toHaveCount(0);
});
