import { test, expect } from "@playwright/test";
import { RAIL, promptCard, copyButton, press, ready } from "./helpers";

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
  await ready(page);

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

test("the vote page says what is happening when there is no backend", async ({
  page,
}) => {
  await page.goto("/vote");
  await expect(page.getByRole("heading")).toContainText("Voting is offline");
  // No spinner left running, and no dead question to answer into nothing.
  await expect(page.locator("button[data-option]")).toHaveCount(0);
});

test("sign-in says accounts are offline rather than failing on submit", async ({
  page,
}) => {
  await page.goto("/signin");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Sign in");
  await expect(page.locator("main")).toContainText("Accounts are offline");
  // The offer to sign in is withdrawn, not left there to fail when tapped.
  await expect(page.getByText("Continue with Google")).toHaveCount(0);
});

test("a failed sign-in lands somewhere that explains itself", async ({ page }) => {
  await page.goto("/auth/error");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "did not sign you in",
  );
  // And offers the route that does not depend on the thing that just broke.
  await expect(page.locator("main")).toContainText("do not need an account to vote");
});

test("the presenter console says it is offline instead of rendering dead controls", async ({
  page,
}) => {
  // Backend-off, the server gate short-circuits before any sign-in redirect:
  // the page stays at /admin and explains itself, with zero buttons — an
  // Open control that could never write would be the quiet failure the whole
  // deck argues against.
  await page.goto("/admin");
  await expect(page.locator("main")).toContainText("offline");
  await expect(page.getByRole("button")).toHaveCount(0);
  expect(page.url()).toContain("/admin");
});
