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
