import { expect, test, type Page } from "@playwright/test";

// Desktop spec DS 13.3: the desktop layout, run by the desktop-chromium and
// desktop-webkit projects at 1440 × 900.

const nav = (page: Page) => page.getByRole("navigation", { name: "Main" });

test.describe("app shell (DS 5)", () => {
  test("DesktopNav is on every screen but /play, marking the current one", async ({ page }) => {
    for (const [path, current] of [
      ["/", "Chi è?"],
      ["/progress", "Progress"],
      ["/settings", "Settings"],
      ["/privacy", null],
    ] as const) {
      await page.goto(path);
      await expect(nav(page), path).toBeVisible();
      for (const name of ["Chi è?", "Play", "Progress", "Settings", "Guest · Sign in"])
        await expect(nav(page).getByRole("link", { name, exact: true }), path).toBeVisible();
      const marked = nav(page).locator('[aria-current="page"]');
      if (current) {
        await expect(marked, path).toHaveCount(1);
        await expect(marked, path).toHaveText(current);
      } else {
        await expect(marked, path).toHaveCount(0);
      }
    }
    await page.goto("/play?seed=1");
    await expect(page.getByRole("list", { name: "Board" })).toBeVisible();
    await expect(nav(page)).toHaveCount(0);
  });

  test("the nav shows at 1024 wide, not at 1023, and follows a resize", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 640 });
    await page.goto("/");
    await expect(nav(page)).toBeVisible();
    await page.setViewportSize({ width: 1023, height: 640 });
    await expect(nav(page)).toHaveCount(0);
    // Below lg the screen is the phone's 448px column, as before.
    expect(await page.locator("main").evaluate((m) => m.getBoundingClientRect().width)).toBe(448);
    await page.setViewportSize({ width: 1024, height: 640 });
    await expect(nav(page)).toBeVisible();
  });

  test("Play reads Continue while a round is saved, and the links go where they say", async ({
    page,
  }) => {
    await page.goto("/");
    await nav(page).getByRole("link", { name: "Progress" }).click();
    await expect(page).toHaveURL(/\/progress$/);
    await nav(page).getByRole("link", { name: "Guest · Sign in" }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await nav(page).getByRole("link", { name: "Play", exact: true }).click();
    await expect(page.getByRole("list", { name: "Board" })).toBeVisible();
    // Flip a card so the round is saved, then come back.
    await page.locator('ul[aria-label="Board"] button[aria-pressed="false"]').first().click();
    await page.goto("/");
    await expect(nav(page).getByRole("link", { name: "Continue", exact: true })).toBeVisible();
  });
});

test("no horizontal scroll on any screen at 1024 and 1440 wide", async ({ page }) => {
  for (const width of [1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    for (const path of ["/", "/progress", "/settings", "/privacy"]) {
      await page.goto(path);
      await expect(nav(page)).toBeVisible();
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth, `${path} at ${width}`).toBe(width);
    }
  }
});
