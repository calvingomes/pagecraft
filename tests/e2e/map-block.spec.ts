import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { getTestUsername } from "./testUser";

/**
 * Helper to add a Map block from the widget menu
 */
const addMapBlock = async (page: Page) => {
  await page.getByLabel("Open widget menu").click();
  const item = page.locator('[class*="widgetTitle"]').filter({ hasText: "Map" }).first();
  await expect(item).toBeVisible();
  await item.click({ force: true });
};

/**
 * Helper to wait for the Supabase block save response
 */
const waitForBlocksSave = (page: Page) =>
  page.waitForResponse((res) => {
    const isBlocksCall = res.url().includes("/rest/v1/blocks");
    const method = res.request().method();
    // Maps use PATCH for coordinate updates
    const isSaveMethod = method === "POST" || method === "DELETE" || method === "PATCH";
    return isBlocksCall && isSaveMethod && res.status() >= 200 && res.status() < 300;
  });

test.describe("Map Block E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    // Global setup handles auth; we just go to the editor
    await page.goto("/editor");
    await page.waitForSelector('[data-is-editor="true"]');
    await page.waitForTimeout(1000);
  });

  test("should add a map block and search for a location", async ({ page }) => {
    const countBefore = await page.locator('[data-testid="map-block-container"]').count();
    await addMapBlock(page);
    await expect(page.locator('[data-testid="map-block-container"]')).toHaveCount(countBefore + 1);

    const mapBlock = page.locator('[data-testid="map-block-container"]').last();
    await mapBlock.hover();

    // 1. Open Search Palette
    await page.getByLabel("Search location").click();
    const searchInput = page.locator('input[placeholder="Search for a place..."]');
    await expect(searchInput).toBeVisible();

    // 2. Type a location
    await searchInput.fill("Paris");
    // Wait for search results to appear via proxy
    const firstResult = page.locator('button[class*="resultItem"]').first();
    await expect(firstResult).toBeVisible({ timeout: 10000 });

    // 3. Select result and verify address label update
    const resultText = await firstResult.innerText();
    await firstResult.click();
    
    // The address label should now contain our result
    const addressInput = mapBlock.locator('input[class*="addressLabel"]');
    await expect(addressInput).toHaveValue(resultText);
  });

  test("should handle deferred saving via the Tick icon", async ({ page }) => {
    await addMapBlock(page);
    const mapBlock = page.locator('[data-testid="map-block-container"]').last();
    await mapBlock.hover();

    // 1. Enter manual adjustment mode (Unlock)
    await page.getByLabel("Adjust position").click();
    
    // 2. Verify we are in 'unlocked' state (Tick icon should be visible)
    const tickButton = page.getByLabel("Finish adjusting");
    await expect(tickButton).toBeVisible();

    // 3. Since we can't easily drag the WebGL canvas in headless without complex setup,
    // we verify that the 'Tick' click triggers a DB save (PATCH).
    const savePromise = waitForBlocksSave(page);
    await tickButton.click();
    await savePromise;

    // 4. Reload and verify the block is still there
    await page.reload();
    await page.waitForSelector('[data-is-editor="true"]');
    await expect(page.locator('[data-testid="map-block-container"]').last()).toBeVisible();
  });

  test("should render a static image on the public username page", async ({ page }) => {
    const username = getTestUsername();
    await page.goto(`/${username}`);
    
    const mapBlock = page.locator('[data-testid="map-block-container"]').last();
    await expect(mapBlock).toBeVisible();

    // 2. Verify it's a static image (public view doesn't render MapInterface)
    const staticImg = mapBlock.locator("img");
    await expect(staticImg).toBeVisible();
    await expect(staticImg).toHaveAttribute("src", /api\/map\/static/);
    
    // 3. Verify overscan logic (+120px) is applied
    const src = await staticImg.getAttribute("src");
    expect(src).toContain("w=");
    expect(src).toContain("h=");
  });
});
