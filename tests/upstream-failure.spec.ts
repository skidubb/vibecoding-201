import { test, expect } from "@playwright/test";
import { RAIL, promptCard, copyButton, press } from "./helpers";

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

test("a rejected clipboard write is surfaced, not swallowed", async ({ page }) => {
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
  // The reader is told what to do instead, rather than left with a button that
  // appears to have worked.
  await press(copyButton(card), "Press ⌘C");

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

test("a poll renders and says so when there is no backend", async ({ page }) => {
  // No Supabase environment is configured in this run, which is the same state
  // the site is in if the project is paused, the keys are pulled, or
  // NEXT_PUBLIC_BACKEND_DISABLED is set to kill the backend mid-class.
  await page.goto("/#poll-debugging");
  const section = page.locator("#poll-debugging");

  // The question and every option still read. A visitor months later, and the
  // room if the backend dies, both still get the teaching content.
  await expect(section).toContainText("The first build works except for one repeatable error.");
  await expect(section.locator("button[data-option]")).toHaveCount(4);
  await expect(section).toContainText(
    "Provide the error, reproduction steps, and expected behavior",
  );

  // And it says what is wrong rather than offering a button that does nothing.
  await expect(section).toContainText("Voting is offline");
  await expect(section.locator("button[data-option]").first()).toBeDisabled();
});

test("the correct answer is not in the page when no poll is revealed", async ({ page }) => {
  // The registry is imported by client code, so anything in it ships to the
  // browser. Correct answers and debriefs live in Postgres behind a column
  // grant for this reason — on a page that tells the room hiding records in
  // the interface is not security, shipping the answer would be an own goal.
  await page.goto("/#poll-debugging");
  const html = await page.content();

  expect(html).not.toContain("correct_option_id");
  expect(html).not.toContain("Debugging is delegation with evidence attached. A throws away");
  expect(html).not.toContain("planted distractor");
});
