import { test as base, expect } from "@playwright/test";
import { sealData } from "iron-session";

// Admin auth fixture: builds a REAL sealed session cookie (same shape the app
// sets on login) and injects it, so admin routes can be tested regardless of
// the DEV_UA_SWITCH flag. No real login round-trip, no DB writes.
const SESSION_COOKIE = "deroarts_admin";

export const test = base.extend<{ adminPage: import("@playwright/test").Page }>({
  adminPage: async ({ page, baseURL }, use) => {
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error("SESSION_SECRET (>=32 chars) required to seal the test session cookie");
    }
    const email = process.env.ADMIN_EMAIL ?? "admin@deroarts.com";
    const sealed = await sealData({ email, loggedIn: true }, { password: secret });

    const url = new URL(baseURL ?? "http://localhost:5001");
    await page.context().addCookies([
      {
        name: SESSION_COOKIE,
        value: sealed,
        domain: url.hostname,
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    await use(page);
  },
});

export { expect };
