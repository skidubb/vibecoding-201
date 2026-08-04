import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ready, scrollY, settle } from "./helpers";

/**
 * "Malformed input", from the deck's own minimum test pack.
 *
 * The assignment is the one place on the site where an attendee types free text
 * that a presenter may read aloud to a hundred people, so what it refuses matters
 * as much as what it stores. These run backend-off, which is the state the whole
 * suite runs in: every refusal here happens before a network call, and that is
 * deliberate — validation that only exists in Postgres cannot tell the writer
 * what is wrong while they still have time to fix it.
 */

const EXERCISE = "#spec-plan-block";

/**
 * The clock, read from the registry rather than pinned here.
 *
 * It was pinned as the literal "2:00" and the deck was re-cut to a fifteen-minute
 * assignment, which failed this file for a reason that had nothing to do with the
 * behaviour under test. A test that has to be edited every time the copy moves is
 * a test people learn to edit without reading.
 */
const CLOCK = (() => {
  const src = readFileSync(join(__dirname, "..", "src", "content", "sections.ts"), "utf8");
  const block = src.split('id: "spec-plan-block"')[1] ?? "";
  const seconds = Number(block.match(/seconds: (\d+)/)?.[1]);
  if (!Number.isFinite(seconds)) throw new Error("no spec block in the registry");
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
})();

test.beforeEach(async ({ page }) => {
  await page.goto("/#spec-plan-block");
  await ready(page);
  await settle(page);
});

test("an empty spec is refused, in words, before anything is sent", async ({ page }) => {
  const section = page.locator(EXERCISE);
  await section.locator("[data-submit]").click();

  await expect(section.getByText("Write at least the three lines")).toBeVisible();
});

test("whitespace is not a spec", async ({ page }) => {
  const section = page.locator(EXERCISE);
  await section.locator("textarea").fill("        \n\n   \n");
  await section.locator("[data-submit]").click();

  await expect(section.getByText("Write at least the three lines")).toBeVisible();
});

test("a real spec gets past validation and meets the offline state in words", async ({
  page,
}) => {
  // The backend is switched off for this run, so the honest answer is that
  // nothing was sent — not a spinner, and not a button that appears to have
  // worked. This is the kill-switch rehearsal for the exercise.
  const section = page.locator(EXERCISE);
  await section
    .locator("textarea")
    .fill("Job — route inbound demo requests\nUser — SDR, may reassign\nDone — every request has an owner within 15 minutes");
  await section.locator("[data-submit]").click();

  await expect(section.getByText(/Nothing was sent/)).toBeVisible();
});

test("the timer counts down, and resets", async ({ page }) => {
  const section = page.locator(EXERCISE);
  const timer = section.locator("[data-timer]");

  await expect(timer).toHaveText(CLOCK);

  await section.locator("[data-timer-toggle]").click();
  await expect(timer).not.toHaveText(CLOCK, { timeout: 4000 });

  await section.getByRole("button", { name: "Reset" }).click();
  await expect(timer).toHaveText(CLOCK);
});

test("typing a spec does not drive the deck", async ({ page }) => {
  // The presenter's arrow keys are global, and this is the one section where a
  // hundred people are typing prose into a box on their own devices. An arrow
  // press that jumps the deck instead of moving the caret would throw every
  // one of them out of the exercise, mid-sentence, with no way back to it.
  const section = page.locator(EXERCISE);
  const box = section.locator("textarea");

  await box.fill("Job — reconcile paid invoices");
  await box.click();
  const before = await scrollY(page);

  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(600);

  expect(await scrollY(page)).toBe(before);
});

test("the cold open shows two screens that are identical", async ({ page }) => {
  // The slide's entire argument is that nothing visible tells the two apart —
  // "two identical screens, radically different value". If the previews ever
  // diverge, the room can pick the better-looking one and the trap is gone
  // before anyone has thought about what sits underneath.
  await page.goto("/#cold-open");
  await ready(page);
  await settle(page);

  const screens = page.locator("#cold-open [role='img']");
  await expect(screens).toHaveCount(2);

  // Geometry measured relative to each screen's own top-left, plus the fill of
  // every part. Comparing the two as images does not work and should not be
  // attempted: the panels are translucent, so the section's glow renders
  // through them differently at each x and the bytes differ while the drawing
  // is the same. What has to match is the drawing.
  const shape = await screens.evaluateAll((els) =>
    els.map((el) => {
      const root = el.getBoundingClientRect();
      return JSON.stringify({
        text: el.textContent,
        size: [root.width, root.height],
        parts: [...el.querySelectorAll("span")].map((s) => {
          const r = s.getBoundingClientRect();
          return [
            +(r.x - root.x).toFixed(2),
            +(r.y - root.y).toFixed(2),
            +r.width.toFixed(2),
            +r.height.toFixed(2),
            getComputedStyle(s).backgroundColor,
          ];
        }),
      });
    }),
  );

  expect(shape[0]).toBe(shape[1]);
});

test("the system under screen B exists and stays hidden before the reveal", async ({
  page,
}) => {
  // Backend-off is the pre-reveal state: polls read as closed, which is
  // exactly what an attendee sees before Shift-R. The seven nodes have to be
  // in the DOM (the reveal only animates them, it does not fetch them) while
  // contributing nothing visible and no height — the identical-screens test
  // above is what breaks if they ever take up room.
  await page.goto("/#cold-open");
  await ready(page);
  await settle(page);

  const nodes = page.locator("#cold-open [data-system-node]");
  await expect(nodes).toHaveCount(7);
  for (const node of await nodes.all()) {
    await expect(node).not.toBeVisible();
  }
});
