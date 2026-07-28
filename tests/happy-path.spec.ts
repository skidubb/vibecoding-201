import { test, expect } from "@playwright/test";
import {
  RAIL,
  promptCard,
  copyButton,
  press,
  ready,
  scrollY,
  scrollsPast,
  settle,
} from "./helpers";

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
  await ready(page);
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

  await expect(page.locator("div.fixed.bottom-6 span").first()).toHaveText("4");
});

test("every rail tick is on screen, so every section can be reached", async ({
  page,
}) => {
  // The rail is position: fixed, so a tick outside the viewport cannot be
  // scrolled to — it is unreachable, not merely inconvenient.
  //
  // At 40 sections it outgrew the screen. Each row was 17px because the
  // hidden label is a flex sibling and opacity:0 still occupies layout, so
  // 40 rows plus 39 twelve-pixel gaps came to 1128px: 16 ticks off-screen at
  // 1280x720 and 2 at the 1920x1080 this is presented on, which put the title
  // and the close out of reach in front of a room.
  const viewport = page.viewportSize()!;
  const ticks = await page
    .locator(RAIL)
    .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
  const heights = await page
    .locator(RAIL)
    .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().bottom));

  expect(ticks.length).toBeGreaterThan(0);
  const offscreen = ticks.filter((top, i) => top < 0 || heights[i] > viewport.height);
  expect(
    offscreen.length,
    `${offscreen.length} of ${ticks.length} rail ticks sit outside the viewport`,
  ).toBe(0);
});

test("a prompt copies to the clipboard, verbatim", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  const card = await promptCard(page, "The plan prompt");
  await press(copyButton(card), "Copied");

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
  await expect(page.locator("div.fixed.bottom-6 span").first()).toHaveText("7");
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

test("walking the deck with one key shows every section in full", async ({ page }) => {
  // The walk a presenter actually performs: title to close, arrow key only.
  //
  // Height is not the risk — a section grows rather than clips, so nothing is
  // destroyed. Reachability is. Stops are granted per half-viewport of
  // overshoot, so a section that runs over by less than that got exactly one
  // stop and its tail was unreachable by any key press. The Bar overran by
  // 251px, which put its last three items and the line that closes the section
  // behind a wheel gesture the presenter has no reason to make.
  //
  // Asserted per section against the furthest the walk travelled *while that
  // section was the active one*: the next section's stop also brings the
  // previous one's bottom edge into frame, and would pass an assertion that
  // only looked at scroll positions.
  test.setTimeout(240_000);

  const railIndex = () =>
    page
      .locator(RAIL)
      .evaluateAll((els) =>
        els.findIndex((el) => el.getAttribute("aria-current") === "true"),
      );

  await settle(page);
  // The hero's own entrance runs on a 0.28s delay over 0.9s, and `settle`
  // returns as soon as the page stops moving — roughly 200ms in. Sampling
  // then catches the opening slide mid-fade and reports it as never revealed.
  await page.waitForTimeout(1600);

  /** section index -> furthest scrollY reached while it was active. */
  const furthest = new Map<number, number>();
  /** Copy that was on screen at a stop and still fully transparent. */
  const ghosts = new Set<string>();

  const record = async () => {
    const [i, y] = await Promise.all([railIndex(), scrollY(page)]);
    if (i >= 0) furthest.set(i, Math.max(furthest.get(i) ?? 0, y));

    // Entrance reveals are keyed to an intersection margin, so copy resting
    // inside that margin at a section's final stop can sit at opacity 0 with
    // no scrolling left to trigger it — present in the DOM, absent from the
    // room. The Bar's closing line did exactly that.
    // Scoped to the active section — the slide the room is on. The hero
    // deliberately fades as you scroll off it, and it is still in frame while
    // the next section takes over.
    if (i < 0) return;
    for (const g of await page.evaluate((index) => {
      const vh = window.innerHeight;
      const found: string[] = [];
      const section = document.querySelectorAll("main section[id]")[index];
      if (!section) return found;
      const nodes = section.querySelectorAll("p, h1, h2, h3");
      for (const el of nodes) {
        const text = (el.textContent ?? "").trim();
        if (text.length < 12) continue;
        const r = el.getBoundingClientRect();
        // Wholly inside the viewport: this is copy the room is looking at.
        if (r.height === 0 || r.top < 0 || r.bottom > vh) continue;
        let node: Element | null = el;
        let opacity = 1;
        while (node && node !== document.body) {
          const o = parseFloat(getComputedStyle(node).opacity);
          if (!Number.isNaN(o)) opacity = Math.min(opacity, o);
          node = node.parentElement;
        }
        // Fully transparent only — a mid-flight reveal is not a defect.
        if (opacity < 0.05) {
          found.push(`${section.id}: ${text.slice(0, 48)}`);
        }
      }
      return found;
    }, i)) {
      ghosts.add(g);
    }
  };
  await record();

  let stalled = 0;
  let previous = await scrollY(page);
  // Generous: the stop count is measured, not fixed, and a narrow window gives
  // more sections a second beat. The loop exits on two dead presses anyway.
  for (let i = 0; i < 120 && stalled < 2; i++) {
    await page.keyboard.press("ArrowRight");
    // Wait for the ease to begin, then for it to actually finish, rather than
    // guessing a duration. Lenis holds a scroll lock and drops any press
    // issued inside it, and a fixed wait that is comfortable on an idle
    // machine is not comfortable under a fully parallel run — which is how
    // this walk failed in the suite and passed every time on its own.
    await page.waitForTimeout(350);
    await settle(page);
    await record();
    const y = await scrollY(page);
    stalled = y === previous ? stalled + 1 : 0;
    previous = y;
  }

  // The walk actually finished, rather than stalling somewhere in the middle
  // and reporting every unvisited section as fine by never asking about it.
  expect(await railIndex(), "the walk never reached the last section").toBe(
    (await page.locator(RAIL).count()) - 1,
  );

  const hidden = await page.evaluate((entries) => {
    const vh = window.innerHeight;
    const els = [...document.querySelectorAll("main section[id]")];
    return entries
      .map(([index, y]) => {
        const el = els[index] as HTMLElement;
        const bottom = el.getBoundingClientRect().top + window.scrollY + el.offsetHeight;
        const short = Math.round(bottom - (y + vh));
        // Tolerance is the section's own bottom padding, not a magic number:
        // a section resting a few pixels past the fold on empty padding has
        // shown the room everything it has to say. Past the padding, the copy
        // itself is being cut.
        const slack = parseFloat(getComputedStyle(el).paddingBottom) || 0;
        return short <= slack + 2 ? null : { id: el.id, short };
      })
      .filter(Boolean);
  }, [...furthest.entries()]);

  expect(
    hidden,
    `sections whose tail no key press ever reveals: ${JSON.stringify(hidden)}`,
  ).toEqual([]);

  expect(
    [...ghosts],
    `copy on screen at a stop but never faded in:\n${[...ghosts].join("\n")}`,
  ).toEqual([]);
});

test("the chrome layer mirrors the active section's theme", async ({ page }) => {
  const chrome = page.locator("#deck-chrome");
  const sections = page.locator("main section[id]");
  const count = await sections.count();

  // Every section costs a click, a settle, and two assertions; at 40 sections
  // the default 30s budget is a flake generator. Scaled from the DOM rather
  // than pinned, for the same reason the loop below is.
  test.setTimeout(30_000 + count * 4_000);

  // Every section is checked against its own theme rather than a handful of
  // fixed indices. Index-pinned assertions pass until someone inserts a
  // section, then fail for a reason that has nothing to do with the invariant.
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    const expected = await sections.nth(i).getAttribute("data-theme");
    await page.locator(RAIL).nth(i).click();
    // Let the jump finish before asking where we are. Lenis holds a scroll
    // lock through its ease and drops a scrollTo issued inside it, so clicking
    // the next tick immediately leaves the deck on a section it passed.
    await settle(page);
    await expect(page.locator("div.fixed.bottom-6 span").first()).toHaveText(
      String(i + 1),
    );
    await expect(chrome, `section ${i} is ${expected}`).toHaveAttribute(
      "data-theme",
      expected!,
    );
    seen.add(expected!);
  }

  // And the deck really does alternate, so the mirror is being exercised in
  // both directions rather than sitting on one value the whole way down.
  expect([...seen].sort()).toEqual(["dark", "light"]);
});

test("the kit and the report both point a presenter at the console", async ({ page }) => {
  // /admin is the one URL worth remembering, and these two public pages are
  // where a presenter who forgot it will be standing.
  for (const path of ["/kit", "/report"]) {
    await page.goto(path);
    await expect(page.getByRole("link", { name: "Presenter" })).toHaveAttribute(
      "href",
      "/admin",
    );
  }
});
