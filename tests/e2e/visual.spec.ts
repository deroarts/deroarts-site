import { test, expect } from "@playwright/test";

// Visual regression: full-page screenshots per viewport (desktop + mobile,
// from the config projects). First run creates baselines; later runs fail on
// visual drift. Read-only — no interaction with the DB.
// Images (network placeholders) are hidden to keep snapshots deterministic.

const pages = [
  { name: "home", path: "/" },
  { name: "progetti", path: "/progetti" },
  { name: "contatti", path: "/contatti" },
];

for (const p of pages) {
  test(`visual: ${p.name}`, async ({ page }, testInfo) => {
    await page.goto(p.path);
    await page.waitForLoadState("networkidle");
    // Neutralize remote placeholder images for stable snapshots.
    await page.addStyleTag({ content: "img{visibility:hidden!important}" });
    await expect(page).toHaveScreenshot(`${p.name}-${testInfo.project.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });
}
