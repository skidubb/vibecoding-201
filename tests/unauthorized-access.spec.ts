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

  const links = page.locator("a[download]");
  await expect(links).toHaveCount(6);

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

test("the deck points at the kit from the last slide", async ({ page }) => {
  // The close is a `cta`, which ignored `footnote` entirely until the kit
  // needed a home there. The room is told where to get it on the last slide
  // they look at, so this is the link most likely to be silently missing.
  await page.goto("/#close");
  await ready(page);
  await settle(page);

  await expect(
    page.locator("#close").getByRole("link", { name: /kit/i }),
  ).toHaveAttribute("href", "/kit");
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
});
