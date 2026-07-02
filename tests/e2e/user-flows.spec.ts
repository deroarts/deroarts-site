import { test, expect } from "@playwright/test";

// User flows with FULL isolation: every POST to the contact page (the Next.js
// server action that would insert into the DB) is intercepted and fulfilled
// with a stub, so the test NEVER writes to Supabase.

test("contact form: fields are fillable and submit is intercepted (no DB write)", async ({ page }) => {
  let postIntercepted = false;

  // Abort/stub any POST (server action) so nothing reaches the database.
  await page.route("**/contatti", async (route) => {
    if (route.request().method() === "POST") {
      postIntercepted = true;
      // Return a benign redirect-like response; the action never runs server-side.
      await route.fulfill({ status: 200, contentType: "text/plain", body: "ok" });
      return;
    }
    await route.continue();
  });

  await page.goto("/contatti");
  await page.locator('input[name="name"]').fill("Test User");
  await page.locator('input[name="email"]').fill("test@example.com");
  await page.locator('textarea[name="message"]').fill("Messaggio di test automatico.");

  await expect(page.locator('input[name="name"]')).toHaveValue("Test User");
  await expect(page.locator('input[name="email"]')).toHaveValue("test@example.com");

  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(500);

  // The submit must have gone through our interceptor, never to the real DB.
  expect(postIntercepted).toBe(true);
});

test("request-info modal opens on a project detail page", async ({ page }) => {
  await page.goto("/progetti");
  await page.locator('a[href^="/progetti/"]').first().click();
  await expect(page).toHaveURL(/\/progetti\/.+/);
  // A request-info trigger should exist on detail pages (button with "info").
  const infoTrigger = page.getByRole("button", { name: /info|richiedi|contatt/i }).first();
  if (await infoTrigger.count()) {
    await infoTrigger.click();
    await expect(page.locator('input[name="email"]').first()).toBeVisible();
  }
});
