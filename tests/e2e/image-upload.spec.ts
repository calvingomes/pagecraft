import { expect, test } from "@playwright/test";
import { getTestUsername } from "./testUser";

const fixturePath = "tests/fixtures/test-image.png";

test("should upload an image to an image block and display it", async ({ page }) => {
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');

  await page.setInputFiles(
    'input[type="file"][accept="image/png,image/jpeg,image/webp"]',
    fixturePath,
  );

  await expect(page.locator(".react-grid-item img, .react-grid-item picture img").first()).toBeVisible({
    timeout: 15000,
  });
});

test("should show the uploaded image on the public view page after save", async ({ page }) => {
  const username = getTestUsername();
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  const savePromise = page.waitForResponse((res) => {
    const isBlocksCall = res.url().includes("/rest/v1/blocks");
    const method = res.request().method();
    const isSaveMethod = method === "POST" || method === "DELETE";
    return isBlocksCall && isSaveMethod && res.status() >= 200 && res.status() < 300;
  });
  await page.setInputFiles(
    'input[type="file"][accept="image/png,image/jpeg,image/webp"]',
    fixturePath,
  );
  await savePromise;

  await page.goto(`/${username}`);
  const blockImage = page.locator('[data-testid="block-item"] img').first();
  await expect(blockImage).toBeVisible({ timeout: 15000 });
  const src = await blockImage.getAttribute("src");
  expect(src ?? "").toContain(".webp");
  expect(src ?? "").toContain(".supabase.co");
});

test("should reject a file with an unsupported extension", async ({ page }) => {
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  await page.waitForTimeout(1500);

  const before = await page.locator(".react-grid-item").count();
  await page.setInputFiles(
    'input[type="file"][accept="image/png,image/jpeg,image/webp"]',
    {
      name: "bad.bmp",
      mimeType: "image/bmp",
      buffer: Buffer.from("bm"),
    },
  );
  await page.waitForTimeout(1000);
  const after = await page.locator(".react-grid-item").count();
  expect(after).toBe(before);
});
