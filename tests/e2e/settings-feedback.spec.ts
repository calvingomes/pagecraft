import { expect, test } from "@playwright/test";

test("shows validation error for short feedback without submitting", async ({ page }) => {
  let feedbackInsertRequested = false;
  page.on("request", (request) => {
    const isFeedbackInsert =
      request.method() === "POST" && request.url().includes("/rest/v1/feedback");
    if (isFeedbackInsert) feedbackInsertRequested = true;
  });

  await page.goto("/settings");

  await page.waitForSelector("text=Support", { timeout: 15000 });

  await page
    .getByPlaceholder("Describe what happened and what you expected...")
    .fill("hey");
  await page.getByRole("button", { name: "Submit feedback" }).click();

  await expect(
    page.getByText("Please enter at least 5 characters of feedback."),
  ).toBeVisible({ timeout: 15000 });
  expect(feedbackInsertRequested).toBe(false);
});
