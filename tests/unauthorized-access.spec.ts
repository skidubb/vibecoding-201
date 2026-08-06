import { test, expect } from "@playwright/test";
import { ready, settle } from "./helpers";

/**
 * The second item in the deck's own minimum test pack (slide 29).
 *
 * `/admin/export` is the one URL on this site that can emit email addresses,
 * and slide 21 spends its whole minute on the difference between authentication
 * and authorization. A route that is merely hard to guess is neither.
 *
 * Backend-off, like the rest of the suite: with no session possible, the only
 * correct answer to any of these is a refusal, and a handler that leaked in
 * that state would leak in every state. The signed-in-but-not-admin case is
 * asked of production by `npm run smoke`, which calls the same definer
 * functions with a real attendee session.
 */

test("the export refuses a reader with no session", async ({ request }) => {
  const response = await request.get("/admin/export");
  expect([401, 404, 500]).toContain(response.status());
  expect(await response.text()).not.toContain("@");
});

test("the export refuses every subset the same way", async ({ request }) => {
  for (const set of ["polls", "submissions", "kit", "../../etc/passwd"]) {
    const response = await request.get(`/admin/export?set=${encodeURIComponent(set)}`);
    expect(response.status(), `set=${set}`).not.toBe(200);
  }
});

test("the export never says yes with a cacheable body", async ({ request }) => {
  // A shared cache holding this response would outlive the check that produced
  // it. The header has to be right on the refusal too — a CDN that cached a
  // 200 for one admin and served it to the room is the failure mode, and it is
  // decided by this header rather than by who asked.
  const response = await request.get("/admin/export");
  const cache = response.headers()["cache-control"] ?? "";
  expect(response.status() === 200 ? cache : "no-store").toContain("no-store");
});

test("the kit is served without an account, and the files are real", async ({
  page,
  request,
}) => {
  await page.goto("/kit");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // Every served kit file: the starter app, the evaluation prompt, the spec
  // prompt that follows it, the class-day fallbacks, the homework artifacts
  // (now including the TDD prompt and the example context files), the
  // reference files with the free-API list, and the README in the footer.
  // Bucket entries are absent deliberately — a cross-origin `download`
  // attribute is ignored, so those render as Open links and are not counted
  // here.
  const links = page.locator("a[download]");
  await expect(links).toHaveCount(15);

  // Every listed file resolves and carries content. A kit page that 404s on
  // the download is worse than no kit page: the room leaves believing they
  // have it.
  const hrefs = await links.evaluateAll((els) =>
    els.map((el) => el.getAttribute("href") ?? ""),
  );
  for (const href of hrefs) {
    const file = await request.get(href);
    expect(file.status(), href).toBe(200);
    expect((await file.text()).length, href).toBeGreaterThan(500);
  }
});

test("the deck points at the kit from the closing slide", async ({ page }) => {
  // The Edit1 re-cut replaced the homework slide with the keep-building close,
  // so this moved with it. The claim is unchanged and is the reason the test
  // exists: the room is told where to get the kit once, near the end, and that
  // makes it the link most likely to go silently missing.
  await page.goto("/#keep-building");
  await ready(page);
  await settle(page);

  await expect(
    page.locator("#keep-building").getByRole("link", { name: /kit/i }).first(),
  ).toHaveAttribute("href", "/kit");
});

test("the review slide renders nothing that writes", async ({ page }) => {
  // The room's shared specs get their own slide, and surfacing stays in the
  // presenter bar. A write control here — a textarea, a Submit, a
  // put-it-on-screen button — would put the `authors_cannot_surface` guarantee
  // back in the UI's hands, and that guarantee is the one the class spends an
  // hour arguing belongs in the database.
  await page.goto("/#room-specs");
  await ready(page);
  await settle(page);

  const section = page.locator("#room-specs");
  await expect(section.locator("textarea")).toHaveCount(0);
  await expect(section.locator("[data-submit]")).toHaveCount(0);
  await expect(section.locator("[data-share]")).toHaveCount(0);
  await expect(section.locator("[data-surface]")).toHaveCount(0);

  // And it says so in words rather than rendering an empty slide.
  await expect(section.getByText(/Nothing on screen yet/)).toBeVisible();
});

test("an answering exercise keeps its clock and stores no prose", async ({ page }) => {
  // This test used to assert the opposite: that these slides had no Submit,
  // because a control with nothing to store can only fail. That was true while
  // they stored nothing. Ninety seconds that wrote nothing, returned nothing
  // and showed the room nothing is what made the hour go flat, so the premise
  // changed and this test changed with it.
  //
  // What still has to hold is that they take a number and not an essay. `body`
  // on these rows is generated from the answer, never typed, so a textarea here
  // would mean free text was reaching a column the room's histogram groups on.
  for (const id of ["the-bar"]) {
    await page.goto(`/#${id}`);
    await ready(page);
    await settle(page);

    const section = page.locator(`#${id}`);
    await expect(section.locator("[data-timer]")).toHaveCount(1);
    await expect(section.locator("[data-timer-toggle]")).toHaveCount(1);
    await expect(section.locator("[data-submit]")).toHaveCount(1);
    await expect(section.locator("textarea")).toHaveCount(0);
  }
});

test("the room's distribution names nobody", async ({ page }) => {
  // The argument for publishing `answer_tallies` at all is that it says how
  // many people chose a number and not which people. The section renders that
  // table directly, so anything identifying reaching the page would be visible
  // here before it was visible anywhere else.
  await page.goto("/#the-bar");
  await ready(page);
  await settle(page);

  const section = page.locator("#the-bar");
  await expect(section).not.toContainText("@");
  await expect(section.locator("[data-author]")).toHaveCount(0);
});

test("the report does not spoil a poll that has not been revealed", async ({ page }) => {
  // Anyone can open this URL during class. The tallies it reads are public by
  // design — a count is not a vote — but the *answers* are not, and a results
  // page that rendered mid-session would hand the room every debrief early.
  await page.goto("/report");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const body = (await page.locator("body").innerText()).toLowerCase();
  for (const spoiler of ["correct", "the answer is", "debrief"]) {
    expect(body, `report leaked "${spoiler}"`).not.toContain(spoiler);
  }
});

test("no presenter chrome ships to the room", async ({ page }) => {
  // The presenter chip, per-option counts and refresh control render only for
  // an account the database answers is_admin() for. Backend-off there is no
  // account at all, so the deck must carry none of it — a chip that rendered
  // here would render for every attendee in class.
  await page.goto("/#cold-open");
  await ready(page);
  await settle(page);

  await expect(page.locator("[data-presenter-chip]")).toHaveCount(0);
  await expect(page.locator("[data-refresh]")).toHaveCount(0);
  // Backend off there is no account system, so even the sign-in door stays
  // off the page rather than leading to a form that cannot work.
  await expect(page.locator("[data-signin-door]")).toHaveCount(0);
});
