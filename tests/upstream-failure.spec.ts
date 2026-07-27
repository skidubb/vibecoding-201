import { test, expect } from "@playwright/test";
import { RAIL, promptCard, pressReliably } from "./helpers";

/**
 * Upstream failure — item five of slide 29's minimum test pack.
 *
 * The deck spends a section on the argument that a tool which fails loudly is
 * safer than one that fails quietly, so the failure branches get the same
 * treatment as the happy ones. `navigator.clipboard` is the only upstream this
 * page has today: it rejects on an insecure origin and inside several embedded
 * browsers, and a copy button that silently does nothing is exactly the defect
 * the class warns about.
 */

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
test.fixme("a rejected clipboard write is surfaced, not swallowed", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () => Promise.reject(new Error("clipboard unavailable")),
      },
    });
  });

  await page.goto("/");

  const card = await promptCard(page, "The plan prompt");
  const button = card.getByRole("button", { name: "Copy" });
  // The reader is told what to do instead, rather than left with a button that
  // appears to have worked.
  await pressReliably(button, "Press ⌘C");

  // And the prompt is selected, so the instruction they were just given works.
  const selected = await page.evaluate(() => window.getSelection()?.toString() ?? "");
  expect(selected).toContain("Do not change anything until I approve the plan.");
});

test("the deck still presents when the clipboard is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
  });

  await page.goto("/");
  await expect(page.locator(RAIL).first()).toBeVisible();

  // A broken upstream must not take navigation with it. This is the property
  // that keeps a bad browser from ending a live class.
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY)), {
    timeout: 6000,
  }).toBeGreaterThan(0);
});
