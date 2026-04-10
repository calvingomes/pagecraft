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
  test.setTimeout(90000);
  const username = getTestUsername();

  // Capture browser console errors to surface save failures (e.g. storage upload)
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    // Ignore noisy external/resource errors that don't indicate editor-save failure.
    if (
      text.includes("Failed to load resource: the server responded with a status of 502") ||
      text.includes("Failed to load resource: the server responded with a status of 404") ||
      text.includes("Failed to load resource: the server responded with a status of 401") ||
      text.includes("Refused to execute script")
    ) {
      return;
    }
    consoleErrors.push(text);
  });

  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');

  await page.setInputFiles(
    'input[type="file"][accept="image/png,image/jpeg,image/webp"]',
    fixturePath,
  );

  // Wait for the auto-save to start (2 s debounce + image processing)
  await page.waitForSelector('[data-testid="link-share"][data-saving="true"]', {
    timeout: 15000,
  });
  // Wait for the save attempt to finish (success or failure)
  await page.waitForSelector('[data-testid="link-share"]:not([data-saving="true"])', {
    timeout: 60000,
  });

  if (consoleErrors.length > 0) {
    console.log("Relevant browser errors during save:", consoleErrors.join("\n"));
  }

  await page.goto(`/${username}`);
  const blockImage = page.locator('[data-testid="block-item"] img').first();
  await expect(blockImage).toBeVisible({ timeout: 15000 });
  const src = await blockImage.getAttribute("src");
  expect(src ?? "").toContain(".webp");
  // URL points to Supabase Storage (cloud) or local dev instance
  expect(src ?? "").toMatch(/supabase\.co|127\.0\.0\.1/);
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
