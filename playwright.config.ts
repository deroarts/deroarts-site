import { defineConfig, devices } from "@playwright/test";

// E2E / visual test config. Runs against the local dev server on :5001.
// Reuses an already-running server; otherwise starts one. Never touches the
// production bundle — this file and tests/ are excluded from the app build.
const PORT = 5001;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    // Mobile viewport on Chromium (Pixel 5) — avoids a separate WebKit install.
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: `PORT=${PORT} pnpm dev`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
