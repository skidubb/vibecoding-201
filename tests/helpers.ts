import { expect, type Locator, type Page } from "@playwright/test";

export const RAIL = "nav[aria-label='Section navigation'] button";

export const scrollY = (page: Page) =>
  page.evaluate(() => Math.round(window.scrollY));

/**
 * Waits until the page has stopped moving.
 *
 * Lenis keeps animating after any native scroll — including the one
 * `scrollIntoViewIfNeeded` performs — so an element's box is still travelling
 * when Playwright computes click coordinates. The click then lands wherever
 * that point ended up, hits nothing, and reports success.
 */
export async function settle(page: Page): Promise<number> {
  let last = -1;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(100);
    const y = await scrollY(page);
    if (y === last) return y;
    last = y;
  }
  return last;
}

/** Waits for the deck to move past `from`, then returns where it came to rest. */
export async function scrollsPast(page: Page, from: number): Promise<number> {
  await expect
    .poll(() => scrollY(page), {
      timeout: 6000,
      message: `never scrolled past ${from}`,
    })
    .toBeGreaterThan(from);
  return settle(page);
}

/**
 * The prompt card carrying `label`, scrolled to and holding still.
 *
 * Returns the card so callers can reach inside it, rather than the button, so a
 * test can assert on the body text too.
 */
export async function promptCard(page: Page, label: string): Promise<Locator> {
  await page.goto("/#director-mode");
  await settle(page);
  // Quiescence, not just a stable scroll position. The entrance transition and
  // the observers that fire behind it keep re-rendering for a beat after the
  // page stops moving, and a state update committed inside that window can be
  // dropped. A user scrolling to a prompt and reading it before clicking never
  // hits this; a test that clicks the instant scrolling stops does.
  await page.waitForTimeout(800);
  const card = page.locator("[data-deck-keys='off']").filter({ hasText: label });
  await expect(card).toBeVisible();
  return card;
}

/**
 * Presses a button the way these tests must, plus the check that buys back what
 * that costs.
 *
 * Playwright's click performs its own scrollIntoView. Lenis is still easing
 * afterwards, so the element travels out from under the coordinates Playwright
 * already computed: every mouse event lands on the button un-prevented, the
 * React handler runs, and the resulting render is discarded. The button works
 * correctly in a real browser — verified by hand against `next start` — so the
 * failure is the harness, not the page.
 *
 * `el.click()` dispatches a real DOM click that React handles identically,
 * without moving the page. What it skips is hit-testing, so this first asserts
 * that the button really is the topmost element at its own centre. That covers
 * the regression `el.click()` alone would miss: something invisible sitting on
 * top of the control.
 */
export async function pressReliably(
  button: Locator,
  expected: string | RegExp,
): Promise<void> {
  await expect(button).toBeVisible();

  const hit = await button.evaluate((el) => {
    const { x, y, width, height } = el.getBoundingClientRect();
    const top = document.elementFromPoint(x + width / 2, y + height / 2);
    return top === el || el.contains(top);
  });
  expect(hit, "the button is covered at its own centre point").toBe(true);

  // Press until the label changes, up to three times.
  //
  // Not papering over a failure: a genuinely broken handler never changes the
  // label and this still fails, loudly, after three tries. What it absorbs is
  // the window described above, whose length scales with how loaded the machine
  // is — three workers deep on CI it lasts several seconds, which no fixed
  // sleep survives without making every run pay for the worst case.
  const matcher =
    typeof expected === "string" ? new RegExp(`^${expected}$`) : expected;

  for (let attempt = 1; attempt <= 3; attempt++) {
    await button.evaluate((el: HTMLElement) => el.click());
    try {
      await expect(button).toHaveText(matcher, { timeout: 1500 });
      return;
    } catch {
      if (attempt === 3) throw new Error(`button never showed ${expected}`);
      await button.page().waitForTimeout(500);
    }
  }
}
