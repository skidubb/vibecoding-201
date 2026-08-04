import { expect, type Locator, type Page } from "@playwright/test";

export const RAIL = "nav[aria-label='Section navigation'] button";

export const scrollY = (page: Page) =>
  page.evaluate(() => Math.round(window.scrollY));

/**
 * Waits until the deck can actually receive a key press.
 *
 * The rail is server-rendered, so `toBeVisible()` proves paint, not hydration.
 * A key pressed in that window is swallowed — no listener exists yet — and the
 * test reports working navigation as broken. That is not hypothetical: it is
 * what made the clipboard-degradation spec fail once under a fully parallel
 * run and pass every time in isolation.
 *
 * Lenis writes `.lenis` onto <html> when it initialises, from inside the same
 * provider that installs the keydown handler and from an effect that runs
 * immediately before it in the same commit. The class is therefore a precise
 * signal that the presenter keys are live.
 */
export async function ready(page: Page): Promise<void> {
  await page.waitForFunction(
    () => document.documentElement.classList.contains("lenis"),
    null,
    { timeout: 30_000 },
  );
}

/**
 * Waits until the page has stopped moving.
 *
 * Lenis keeps animating after any native scroll — including the one
 * `scrollIntoViewIfNeeded` performs — so an element's box is still travelling
 * when Playwright computes click coordinates. The click then lands wherever
 * that point ended up, hits nothing, and reports success.
 */
export async function settle(page: Page): Promise<number> {
  // Four consecutive identical samples, not two. Lenis eases out slowly enough
  // that two 100ms samples can round to the same integer while it is still
  // animating and still holding its scroll lock — returning there made the
  // next key press land inside the lock, and a walk of the deck reported
  // phantom dead presses and skipped beats that a presenter never sees.
  let last = -1;
  let same = 0;
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(100);
    const y = await scrollY(page);
    same = y === last ? same + 1 : 0;
    last = y;
    if (same >= 4) return y;
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
  await page.goto("/#spec-and-plan");
  await settle(page);
  // Scoped to the section, not the page: v15 prints the plan prompt a second
  // time on #plan-fire under the same label, so a page-wide filter resolves to
  // two cards and fails strict mode.
  const card = page
    .locator("#spec-and-plan [data-deck-keys='off']")
    .filter({ hasText: label });
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
