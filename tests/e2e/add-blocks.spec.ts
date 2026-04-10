import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const clickWidgetCard = async (page: Page, title: string) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByLabel("Open widget menu").click();
  await expect(page.locator('input[placeholder="Search widgets"]')).toBeVisible();
  const item = page.locator('[class*="widgetTitle"]').filter({ hasText: title }).first();
  await expect(item).toBeVisible();
  await item.click({ force: true });
};

test("should add a text block from the toolbar", async ({ page }) => {
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  await page.waitForTimeout(1500);
  const blocksBefore = await page.locator(".react-grid-item").count();
  await clickWidgetCard(page, "Text");
  await expect(page.locator(".react-grid-item")).toHaveCount(blocksBefore + 1);
});

test("should add a link block from the toolbar", async ({ page }) => {
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  await page.waitForTimeout(1500);
  const blocksBefore = await page.locator(".react-grid-item").count();
  await clickWidgetCard(page, "Website");
  await page.locator('input[placeholder="Add link here"]').fill("example.com");
  await page.getByRole("button", { name: "Create link" }).click();
  await expect(page.locator(".react-grid-item")).toHaveCount(blocksBefore + 1);
});

test("should add an image block from the toolbar", async ({ page }) => {
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  await page.waitForTimeout(1500);
  const blocksBefore = await page.locator(".react-grid-item").count();
  await page.setInputFiles('input[type="file"][accept="image/png,image/jpeg,image/webp"]', {
    name: "small.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5Wn6kAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(page.locator(".react-grid-item")).toHaveCount(blocksBefore + 1);
});

test("should add a section title block from the toolbar", async ({ page }) => {
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  await page.waitForTimeout(1500);
  const blocksBefore = await page.locator(".react-grid-item").count();
  await clickWidgetCard(page, "Section Title");
  await expect(page.locator(".react-grid-item")).toHaveCount(blocksBefore + 1);
});

test("should show the block immediately in the canvas after adding", async ({ page }) => {
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  await clickWidgetCard(page, "Text");
  await expect(page.locator(".react-grid-item").last()).toBeVisible();
});
