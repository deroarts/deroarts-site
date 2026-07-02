import { test, expect } from "@playwright/test";

// Navigation across the public site. Read-only: no forms submitted, no writes.

test("home renders hero and featured projects", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/DeroArts/i);
  // Seeded demo projects must be visible.
  await expect(page.getByText("MoneyBox").first()).toBeVisible();
});

test("home → progetti list", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /progetti/i }).first().click();
  await expect(page).toHaveURL(/\/progetti/);
  await expect(page.getByText(/Gestionale per Agenzie|MoneyBox|Scanner/i).first()).toBeVisible();
});

test("progetti → project detail", async ({ page }) => {
  await page.goto("/progetti");
  // Click the first project card link into its detail page.
  const firstProject = page.locator('a[href^="/progetti/"]').first();
  await firstProject.click();
  await expect(page).toHaveURL(/\/progetti\/.+/);
});

test("contatti page loads with a form", async ({ page }) => {
  await page.goto("/contatti");
  await expect(page.locator('input[name="name"]')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('textarea[name="message"]')).toBeVisible();
});

test("unknown route shows 404", async ({ page }) => {
  const res = await page.goto("/questa-pagina-non-esiste");
  expect(res?.status()).toBe(404);
});
