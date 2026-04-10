import { expect, test } from "@playwright/test";
import { getTestUsername } from "./testUser";

test.skip("should toggle a block to hidden on mobile via the visibility control", async ({ page }) => {
  await page.goto("/editor");
  await page.waitForSelector('[data-is-editor="true"]');
  await page.locator(".react-grid-item").first().hover();
  await page.getByTestId("block-visibility-toggle-mobile").click();
  await expect(page.locator(".react-grid-item").first()).toHaveAttribute(
    "data-hidden-mobile",
    "true",
  );
});

test.skip("should not render a mobile-hidden block on the public view page", async ({ page }) => {
  const username = getTestUsername();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/${username}`);
  await expect(page.getByTestId("block-hidden-mobile-id")).not.toBeVisible();
});
