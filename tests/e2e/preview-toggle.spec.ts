import { expect, test } from "@playwright/test";

test("should toggle from desktop to mobile preview in the editor", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  await page.getByRole("radio", { name: "Preview mobile view" }).click();
  await expect(page.locator('main[data-preview="mobile"][data-framed-mobile-preview="true"]')).toBeVisible();
});

test("should toggle back to desktop preview", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  await page.getByRole("radio", { name: "Preview mobile view" }).click();
  await page.getByRole("radio", { name: "Preview desktop view" }).click();
  await expect(page.locator('main[data-preview="desktop"][data-framed-mobile-preview="true"]')).toBeVisible();
});

test("should not show preview toggle on a mobile-width browser window", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  await expect(page.getByRole("radio", { name: "Preview mobile view" })).not.toBeVisible();
});
