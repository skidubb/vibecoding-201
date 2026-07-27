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
  const card = page.locator("[data-deck-keys='off']").filter({ hasText: label });
  await expect(card).toBeVisible();
  return card;
}

/**
 * The card's copy button.
 *
 * Located by role alone, deliberately. Do not narrow it with `{ name: "Copy" }`:
 * a button's accessible name comes from its text, and that text is the thing
 * under test. The moment a press succeeds the name becomes "Copied" or
 * "Press ⌘C", and a name-scoped locator matches nothing — "Copied" does not
 * contain "Copy", the two diverge at the fourth letter. The assertion that
 * follows then waits on an empty locator and reports a press that worked as a
 * press that was lost. A prompt card holds exactly one button, so role alone is
 * unambiguous.
 */
export function copyButton(card: Locator): Locator {
  return card.getByRole("button");
}

/**
 * Presses the button and waits for the label it owes the reader.
 *
 * The hit test is the part a passing click cannot cover: `click()` fails loudly
 * when something sits on top of the control, but it also auto-scrolls and
 * retries, so it would quietly succeed where a real user is blocked by an
 * invisible overlay. Asserting the button is topmost at its own centre first
 * keeps that regression in scope.
 */
export async function press(
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

  await button.click();
  await expect(button).toHaveText(expected);
}
