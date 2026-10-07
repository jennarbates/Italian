import { expect, test, type Page } from "@playwright/test";
import { content } from "../src/content/index.ts";
import { startGame } from "../src/engine/start.ts";
import { hasSupabase } from "./inbox.ts";

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

test.describe("mouse: hover preview and right-click (DS 7)", () => {
  const tooltip = (page: Page) => page.getByRole("tooltip");

  test("resting on a card shows a larger preview beside it; leaving hides it", async ({ page }) => {
    await page.goto("/play?seed=1");
    const chiara = card(page, "Chiara");
    await chiara.hover();
    await page.waitForTimeout(100);
    await expect(tooltip(page)).toHaveCount(0); // not before the delay
    await page.waitForTimeout(300);
    await expect(tooltip(page)).toBeVisible();
    await expect(tooltip(page)).toHaveText("Chiara");
    const id = await tooltip(page).getAttribute("id");
    await expect(chiara).toHaveAttribute("aria-describedby", id ?? "");
    // Beside the card, never over it, and twice as wide.
    const c = await chiara.boundingBox();
    const t = await tooltip(page).boundingBox();
    if (!c || !t) throw new Error("no boxes");
    expect(t.x >= c.x + c.width || t.x + t.width <= c.x).toBe(true);
    expect(t.width).toBeCloseTo(Math.min(c.width * 2, 256), 0);
    // Straight on to the next card: it swaps at once.
    await card(page, "Davide").hover();
    await expect(tooltip(page)).toHaveText("Davide", { timeout: 200 });
    await page.mouse.move(5, 300);
    await expect(tooltip(page)).toHaveCount(0);
  });

  test("no preview while guessing, or on a phone-sized window", async ({ page }) => {
    await page.goto("/play?seed=1");
    await panel(page).getByRole("button", { name: "Indovina" }).click();
    await page.getByRole("button", { name: /^Guess Chiara: / }).hover();
    await page.waitForTimeout(500);
    await expect(tooltip(page)).toHaveCount(0);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/play?seed=1");
    await card(page, "Chiara").hover();
    await page.waitForTimeout(500);
    await expect(tooltip(page)).toHaveCount(0);
  });

  test("a click hides it, and it has no fade under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/play?seed=1");
    await card(page, "Elena").hover();
    await expect(tooltip(page)).toBeVisible();
    expect(await tooltip(page).evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
    await page.mouse.down();
    await expect(tooltip(page)).toHaveCount(0);
    await page.mouse.up();
  });

  test("right-click opens the card's detail and does not flip it", async ({ page }) => {
    await page.goto("/play?seed=1");
    const davide = card(page, "Davide");
    await davide.hover();
    await expect(tooltip(page)).toBeVisible();
    await davide.click({ button: "right" });
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("img", { name: "Davide" })).toBeVisible();
    await expect(tooltip(page)).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(davide).toHaveAttribute("aria-pressed", "false");
    // Elsewhere, right-click does nothing of ours.
    await page.getByRole("button", { name: "Indovina" }).click({ button: "right" });
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("the context menu key on a focused card opens its detail", async ({ page, browserName }) => {
    await page.goto("/play?seed=1");
    await card(page, "Luca").focus();
    // The key raises contextmenu on the focused element. Macs have no such key and
    // WebKit does not raise it for a simulated one, so there the event is sent.
    if (browserName === "webkit") await card(page, "Luca").dispatchEvent("contextmenu");
    else await page.keyboard.press("ContextMenu");
    await expect(page.getByRole("dialog").getByRole("img", { name: "Luca" })).toBeVisible();
  });
});

// The name of the computer's card in a seeded round, to win it at once.
const cpuName = (seed: number) =>
  content.characters.find((c) => c.id === startGame(seed, 1, content).cpuSecret)?.name ?? "";

test.describe("round end and dialogs (DS 9.2, DS 9.6)", () => {
  test("round end is two columns, with Play again focused and not fixed", async ({ page }) => {
    await page.goto("/play?seed=5");
    await panel(page).getByRole("button", { name: "Indovina" }).click();
    await page.getByRole("button", { name: new RegExp(`^Guess ${cpuName(5)}: `) }).click();
    // Desktop: the dialog's focus starts on Guess, so Enter confirms.
    await expect(
      page.getByRole("dialog").getByRole("button", { name: "Guess", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "You won!" })).toBeVisible();

    const again = page.getByRole("button", { name: "Play again" });
    await expect(again).toBeFocused();
    expect(
      await again.evaluate((el) => getComputedStyle(el.parentElement as Element).position),
    ).toBe("static");
    // The questions sit to the right of the headline.
    const head = await page.getByRole("heading", { name: "You won!" }).boundingBox();
    const questions = await page.getByRole("heading", { name: "Questions" }).boundingBox();
    if (!head || !questions) throw new Error("no boxes");
    expect(questions.x).toBeGreaterThan(head.x + head.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1440);
    await page.keyboard.press("Enter");
    await expect(page.locator("header")).toContainText("Turn 1");
  });

  test("dialogs close on Esc and on the backdrop, and give focus back", async ({ page }) => {
    await page.goto("/play?seed=1");
    const dialog = page.getByRole("dialog");
    // GuessConfirm, opened from the keyboard, at 24rem.
    await panel(page).getByRole("button", { name: "Indovina" }).click();
    const guess = page.getByRole("button", { name: /^Guess Anna: / });
    await guess.focus();
    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    expect((await dialog.boundingBox())?.width).toBe(384);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(guess).toBeFocused();
    await guess.press("Enter");
    await expect(dialog).toBeVisible();
    await page.mouse.click(10, 10);
    await expect(dialog).toBeHidden();
    await expect(guess).toBeFocused();
    // A click on the dialog's own padding does not close it.
    await guess.press("Enter");
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    if (!box) throw new Error("no dialog box");
    await page.mouse.click(box.x + 4, box.y + 4);
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await panel(page).getByRole("button", { name: "Cancel guess" }).click();

    // CardDetail, at 28rem.
    await card(page, "Anna").click({ button: "right" });
    await expect(dialog.getByRole("img", { name: "Anna" })).toHaveJSProperty("offsetWidth", 448);
    await page.mouse.click(10, 10);
    await expect(dialog).toBeHidden();

    // The quit confirmation.
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "Quit round" }).click();
    await expect(dialog).toContainText("Quit this round?");
    await page.mouse.click(10, 10);
    await expect(dialog).toBeHidden();
    await expect(page.locator("header")).toContainText("Turn 1");
  });

  test("the sign-in sheet is a centred modal", async ({ page }) => {
    test.skip(!hasSupabase, "needs the local Supabase (CI starts it)");
    await page.goto("/settings");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    if (!box) throw new Error("no dialog box");
    expect(box.width).toBe(448); // 28rem
    expect(Math.abs(box.x + box.width / 2 - 720)).toBeLessThan(2);
    expect(Math.abs(box.y + box.height / 2 - 450)).toBeLessThan(2);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
