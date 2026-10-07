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

const board = (page: Page) => page.getByRole("list", { name: "Board" });
const panel = (page: Page) => page.locator('aside[aria-label="Questions"]');
const card = (page: Page, name: string) =>
  page.getByRole("button", { name: new RegExp(`^${name}: capelli`) });

test.describe("game: 6 × 4 board and side panel (DS 6)", () => {
  for (const size of [
    { width: 1024, height: 640 },
    { width: 1280, height: 720 },
  ]) {
    test(`all 24 cards and the whole panel fit at ${size.width} × ${size.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await page.goto("/play?seed=1");
      const items = board(page).getByRole("listitem");
      await expect(items).toHaveCount(24);
      for (const item of await items.all()) {
        const box = await item.boundingBox();
        if (!box) throw new Error("no card box");
        expect(box.y).toBeGreaterThanOrEqual(56);
        expect(box.y + box.height).toBeLessThanOrEqual(size.height);
      }
      // Six cards on the first row.
      const tops = await items.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
      expect(tops.filter((t) => t === tops[0])).toHaveLength(6);
      await expect(panel(page).getByRole("button", { name: "Indovina" })).toBeInViewport();
      const scroll = await page.evaluate(() => [
        document.documentElement.scrollWidth,
        document.documentElement.scrollHeight,
      ]);
      expect(scroll).toEqual([size.width, size.height]);
    });
  }

  test("an always-open panel instead of the sheet, in desktop wording", async ({ page }) => {
    await page.goto("/play?seed=1");
    await expect(panel(page)).toBeVisible();
    await expect(page.getByRole("button", { name: /questions$/ })).toHaveCount(0);
    await expect(panel(page)).toContainText("Your turn: ask a question, or guess.");
    await panel(page).getByRole("button", { name: "Indovina" }).click();
    await expect(panel(page)).toContainText("Click the card you think it is.");
  });

  test("card positions are the same in playerTurn and playerReview", async ({ page }) => {
    await page.goto("/play?seed=1");
    const positions = () =>
      board(page)
        .getByRole("listitem")
        .evaluateAll((els) => els.map((e) => JSON.stringify(e.getBoundingClientRect())));
    await expect(board(page).getByRole("listitem")).toHaveCount(24);
    const before = await positions();
    await page.getByRole("list", { name: "Questions to ask" }).getByRole("button").first().click();
    await expect(panel(page).getByRole("button", { name: "Avanti" })).toBeVisible();
    await expect(panel(page)).toContainText("then click Avanti.");
    expect(await positions()).toEqual(before);
  });

  test("card names scale with the card, between 10 and 16 px", async ({ page }) => {
    const nameSize = () =>
      card(page, "Anna")
        .locator("span span span")
        .first()
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    await page.goto("/play?seed=1");
    const big = await nameSize();
    expect(big).toBeGreaterThan(10);
    expect(big).toBeLessThanOrEqual(16);
    await page.setViewportSize({ width: 1024, height: 640 });
    const small = await nameSize();
    expect(small).toBeGreaterThanOrEqual(10);
    expect(small).toBeLessThan(big);
  });

  test("resizing across 1024px keeps flips and a guess in progress", async ({ page }) => {
    await page.goto("/play?seed=3");
    for (const name of ["Marco", "Sara", "Luca"]) await card(page, name).click();
    await panel(page).getByRole("button", { name: "Indovina" }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    const sheet = page.getByRole("region", { name: "Questions" });
    await expect(sheet).toContainText("Tap the card you think it is.");
    await expect(page.getByRole("button", { name: /questions$/ })).toBeVisible();
    for (const name of ["Marco", "Sara", "Luca"])
      await expect(
        page.getByRole("button", { name: new RegExp(`^Guess ${name}: .*flipped down`) }),
      ).toHaveCount(1);
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(panel(page)).toContainText("Click the card you think it is.");
    await panel(page).getByRole("button", { name: "Cancel guess" }).click();
    for (const name of ["Marco", "Sara", "Luca"])
      await expect(card(page, name)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('ul[aria-label="Board"] button[aria-pressed="true"]')).toHaveCount(3);
  });

  test("resizing keeps a half-built Level 2 question", async ({ page }) => {
    await page.goto("/play?level=2&seed=5");
    await page.getByRole("group", { name: "Verb" }).getByRole("button").first().click();
    await page.getByRole("group", { name: "Noun" }).getByRole("button").first().click();
    const slots = page.getByRole("group", { name: "Your question" });
    const built = (await slots.textContent()) ?? "";
    expect(built).toContain("capelli");
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole("region", { name: "Questions" })).toBeVisible();
    await expect(slots).toHaveText(built);
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(panel(page)).toBeVisible();
    await expect(slots).toHaveText(built);
  });
});
