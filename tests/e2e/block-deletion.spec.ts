import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const addTextBlockFromWidgetMenu = async (page: Page) => {
  await page.getByLabel("Open widget menu").click();
  await expect(page.locator('input[placeholder="Search widgets"]')).toBeVisible();
  const title = page.locator('[class*="widgetTitle"]').filter({ hasText: "Text" }).first();
  await expect(title).toBeVisible();
  await title.click({ force: true });
};

const waitForBlocksUpsert = (page: Page) =>
  page.waitForResponse((res) => {
    const isBlocksCall = res.url().includes("/rest/v1/blocks");
    return (
      isBlocksCall &&
      res.request().method() === "POST" &&
      res.status() >= 200 &&
      res.status() < 300
    );
  });

const waitForBlocksDelete = (page: Page) =>
  page.waitForResponse((res) => {
    const isBlocksCall = res.url().includes("/rest/v1/blocks");
    return (
      isBlocksCall &&
      res.request().method() === "DELETE" &&
      res.status() >= 200 &&
      res.status() < 300
    );
  });

test("should delete a block via the delete button", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  await page.waitForTimeout(1500);

  await addTextBlockFromWidgetMenu(page);

  const countBefore = await page.locator(".react-grid-item").count();
  await page.locator(".react-grid-item").last().hover();
  await page.getByRole("button", { name: "Delete block" }).last().click();

  await expect(page.locator(".react-grid-item")).toHaveCount(countBefore - 1);
});

test("should persist block deletion after save and reload", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  await page.waitForTimeout(1500);

  let startingCount = await page.locator(".react-grid-item").count();
  if (startingCount === 0) {
    await addTextBlockFromWidgetMenu(page);
    await waitForBlocksUpsert(page);
    await page.reload();
    await page.waitForSelector('[data-is-editor="true"]');
    await page.waitForTimeout(1500);
    startingCount = await page.locator(".react-grid-item").count();
  }

  const savePromise = waitForBlocksDelete(page);
  await page.locator(".react-grid-item").last().hover();
  await page.getByRole("button", { name: "Delete block" }).last().click();
  const countAfterDelete = await page.locator(".react-grid-item").count();

  await savePromise;
  await page.reload();
  await page.waitForSelector('[data-is-editor="true"]');
  await page.waitForTimeout(1500);
  const countAfterReload = await page.locator(".react-grid-item").count();
  expect(countAfterReload).toBe(countAfterDelete);
});

test("should not show a confirmation dialog before deleting a block", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  await page.waitForTimeout(1500);

  await addTextBlockFromWidgetMenu(page);
  await page.locator(".react-grid-item").last().hover();
  await page.getByRole("button", { name: "Delete block" }).last().click();

  await expect(page.getByRole("dialog")).toHaveCount(0);
});
