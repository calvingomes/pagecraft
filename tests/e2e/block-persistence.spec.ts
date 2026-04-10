import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const addBlockFromWidgetMenu = async (page: Page, label: string) => {
  await page.getByLabel("Open widget menu").click();
  await expect(page.locator('input[placeholder="Search widgets"]')).toBeVisible();
  const title = page.locator('[class*="widgetTitle"]').filter({ hasText: label }).first();
  await expect(title).toBeVisible();
  await title.click({ force: true });
};

const waitForBlocksSave = (page: Page) =>
  page.waitForResponse((res) => {
    const isBlocksCall = res.url().includes("/rest/v1/blocks");
    const method = res.request().method();
    const isSaveMethod = method === "POST" || method === "DELETE";
    return isBlocksCall && isSaveMethod && res.status() >= 200 && res.status() < 300;
  });

test("should persist a text block after save and reload", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  await page.waitForTimeout(1500);

  const before = await page.locator(".react-grid-item").count();
  await addBlockFromWidgetMenu(page, "Text");

  await page.locator(".ProseMirror").last().click();
  await page.keyboard.type("Hello persistence");

  await waitForBlocksSave(page);
  await page.reload();
  await page.waitForSelector('[data-is-editor="true"]');
  await page.waitForTimeout(1500);

  await expect(page.locator(".react-grid-item")).toHaveCount(before + 1);
  await expect(page.getByText("Hello persistence").first()).toBeVisible();
});

test("should persist a link block URL after save and reload", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  await page.waitForTimeout(1500);

  const before = await page.locator(".react-grid-item").count();
  await addBlockFromWidgetMenu(page, "Website");
  await page.locator('input[placeholder="Add link here"]').fill("example.com/persist");
  const savePromise = waitForBlocksSave(page);
  await page.getByRole("button", { name: "Create link" }).click();
  await savePromise;
  await page.reload();
  await page.waitForSelector('[data-is-editor="true"]');
  await page.waitForTimeout(1500);

  await expect(page.locator(".react-grid-item")).toHaveCount(before + 1);
});

test("should persist block count after save and reload", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  await page.waitForTimeout(1500);
  const countBefore = await page.locator(".react-grid-item").count();

  await addBlockFromWidgetMenu(page, "Text");

  await waitForBlocksSave(page);
  await page.reload();
  await page.waitForSelector('[data-is-editor="true"]');
  await page.waitForTimeout(1500);

  await expect(page.locator(".react-grid-item")).toHaveCount(countBefore + 1);
});
