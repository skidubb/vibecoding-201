import { test, expect } from "@playwright/test";
import { RAIL, promptCard, pressReliably, scrollY, scrollsPast } from "./helpers";

/**
 * Happy path — the workflow a presenter and a reader actually run.
 *
 * Scroll assertions poll rather than sleep. Lenis eases over ~1.1s and some
 * stops are only tens of pixels apart, so "sample until it stops changing"
 * reports zero movement if it samples before the easing has begun.
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(RAIL).first()).toBeVisible();
});

test("the rail has one tick per section and scrolls to the one clicked", async ({
  page,
}) => {
  // Counted from the DOM rather than imported from the registry: sections.ts
  // imports .webp files, which Node cannot resolve outside the bundler.
  const sectionCount = await page.locator("main section[id]").count();
  expect(sectionCount).toBeGreaterThan(0);
  await expect(page.locator(RAIL)).toHaveCount(sectionCount);

  await page.locator(RAIL).nth(3).click();
  await scrollsPast(page, 0);

  await expect(page.locator("div.fixed.bottom-6")).toContainText("04");
});

/**
 * UNRESOLVED — these two are skipped, not passing.
 *
 * What is verified: in a real browser against `next start`, clicking Copy sets
 * the label to "Copied", and with the clipboard rejected it sets "Press ⌘C" and
 * selects the prompt text. Checked by hand; the feature works.
 *
 * What fails only under Playwright: the React handler runs (traced: copy()
 * entered, writeText resolved, setState called exactly once with "copied") and
 * the committed DOM still reads "Copy". A render with the new state appears in
 * a render trace and is then followed by one with the old state, on the same
 * component instance, with no unmount and no second setState.
 *
 * Ruled out: clipboard permissions (rejects in 13ms without, resolves in 6ms
 * with), hit-testing (elementFromPoint at the button centre is the button),
 * event delivery (all five mouse events arrive un-prevented), stale builds,
 * parallel workers, and elapsed time (three clicks over six seconds all fail,
 * while a single click after a three-second idle in an isolated run passes).
 *
 * Wrapping the block in Motion's `Reveal` reproduces it and a plain div does
 * not, which is why `RevealStable` exists — but switching to it did not fix the
 * test, so `Reveal` is at most part of the story.
 *
 * Left skipped deliberately. A green suite that does not exercise the feature
 * is worse than an honest skip, and the same interaction pattern is about to
 * carry the polls, so this needs a real answer before Phase 3.
 */
test.fixme("a prompt copies to the clipboard, verbatim", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  const card = await promptCard(page, "The plan prompt");
  const button = card.getByRole("button", { name: "Copy" });
  await pressReliably(button, "Copied");

  // Verbatim matters: an attendee pasting a paraphrase into their agent gets
  // different behaviour from the one the slide promises.
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(
    "Inspect the current project. Propose the smallest coherent implementation for this specification. Identify the data model, permissions, environment variables, failure states, tests, and files involved. Do not change anything until I approve the plan.",
  );
});

test("arrow keys still advance while a rail tick holds focus", async ({ page }) => {
  // The regression this guards: rail ticks are <button>, so a guard that bails
  // on any focused element would strand the presenter mid-talk.
  //
  // Focus is taken with .focus(), not .click() — a click routes through
  // goToStop, which blurs, and would hide the very bug under test.
  const tick = page.locator(RAIL).nth(3);
  await tick.focus();
  await expect(tick).toBeFocused();

  await page.keyboard.press("ArrowRight");
  await scrollsPast(page, 0);
});

test("Space activates a focused rail tick rather than advancing a stop", async ({
  page,
}) => {
  const tick = page.locator(RAIL).nth(6);
  await tick.focus();
  await page.keyboard.press("Space");

  // Space belongs to the button: the deck lands on section 7, which is far
  // beyond the one-stop nudge that advancing would have produced.
  await scrollsPast(page, 0);
  await expect(page.locator("div.fixed.bottom-6")).toContainText("07");
});

test("every presenter key press moves the deck", async ({ page }) => {
  // Stops used to be derived from section height, which handed any section
  // exactly one viewport tall two stops at the same scroll position — a dead
  // arrow press, on stage, once per section.
  //
  // A flat dwell rather than scrollsPast(): Lenis holds a scroll lock through
  // the tail of its ease, and a press issued inside that lock is dropped, so
  // the test has to be slower than the animation it is checking.
  test.setTimeout(90_000);
  let previous = await scrollY(page);

  for (let press = 1; press <= 16; press++) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(1500);
    const landed = await scrollY(page);
    expect(landed, `press ${press} did not move the deck`).toBeGreaterThan(previous);
    previous = landed;
  }
});

test("the chrome layer mirrors the active section's theme", async ({ page }) => {
  const chrome = page.locator("#deck-chrome");
  const themes = new Set<string>();

  for (const i of [0, 3, 6, 9]) {
    await page.locator(RAIL).nth(i).click();
    await expect(page.locator("div.fixed.bottom-6")).toContainText(
      String(i + 1).padStart(2, "0"),
    );
    themes.add((await chrome.getAttribute("data-theme")) ?? "");
  }

  // The deck alternates chapters, so walking it must surface both themes —
  // otherwise the mirror is stuck and every piece of fixed UI is mis-coloured.
  expect([...themes].sort()).toEqual(["dark", "light"]);
});
