import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Rules about the content registry that a type cannot express.
 *
 * Read as source text rather than imported: `sections.ts` imports .webp files,
 * which Node cannot resolve outside the bundler.
 */

// __dirname, not import.meta: this file is compiled to CommonJS by Playwright's
// loader, where import.meta is a syntax error.
const RAW = readFileSync(
  join(__dirname, "..", "src", "content", "sections.ts"),
  "utf8",
);

/**
 * The file with comments stripped.
 *
 * The rules below ban certain words from the registry, and the registry's own
 * comments explain why those words are banned. Checking the raw text makes the
 * explanation trip the rule it explains.
 */
const SOURCE = RAW.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

/** Each top-level `{ … }` entry in the exported array, as raw text. */
function sectionBlocks(source: string = SOURCE): string[] {
  const start = source.indexOf("export const sections");
  const body = source.slice(start);
  return body
    .split(/\n  \{\n/)
    .slice(1)
    .map((block) => block.split(/\n  \},?\n/)[0]);
}

/**
 * The same blocks, with comments left in.
 *
 * `SOURCE` strips `//` to the end of the line, which also truncates every URL in
 * the file: `href: "https://example.com"` becomes `href: "https:`. That had no
 * effect while nothing read a URL out of the registry text. It did break the first
 * version of the GO DEEPER link test below, which parsed zero links from fourteen
 * of fifteen sections and passed because it had nothing left to check. Any test
 * reading an href must use this function.
 */
function sectionBlocksWithUrls(): string[] {
  return sectionBlocks(RAW);
}

test("a poll section gives nothing away before the reveal", () => {
  // A poll's debrief is the answer in prose. It lives in Postgres behind a
  // column grant and arrives only once the presenter reveals, so the registry
  // must not carry any commentary alongside the question — a kicker under a
  // live poll is on screen while the room is still voting.
  //
  // The first version of the debugging poll shipped with "the trap is believing you
  // have to read the code yourself" under the options, which eliminates D and
  // indicates C before anyone has voted.
  const offenders = sectionBlocks()
    .filter((block) => block.includes('layout: "poll"'))
    .filter((block) => /\n\s{4}kicker:/.test(block))
    .map((block) => block.match(/id: "([^"]+)"/)?.[1] ?? "unknown");

  expect(offenders, "poll sections must not carry a kicker").toEqual([]);
});

test("no section carries a correct answer or a debrief", () => {
  // Everything in this file ships to the browser.
  for (const banned of ["correctOption", "correct_option", "debrief", "isCorrect"]) {
    expect(SOURCE, `registry must not mention ${banned}`).not.toContain(banned);
  }
});

test("every section has a unique id, since ids are anchors", () => {
  const ids = [...SOURCE.matchAll(/\n    id: "([^"]+)"/g)].map((m) => m[1]);
  expect(ids.length).toBeGreaterThan(0);
  expect(new Set(ids).size, `duplicate section id in ${ids.join(", ")}`).toBe(
    ids.length,
  );
});

test("no layout silently drops content it was handed", async ({ page }) => {
  // The registry is a bag of optional fields and each layout renders the
  // subset it knows about, so giving a section a field its layout ignores
  // deletes that content from the deck with nothing failing anywhere.
  //
  // `strip` was added to the cards and claim layouts only, and Jordan's three
  // authorization rules, which sit on a split layout, stopped rendering. The build
  // passed and so did every test.
  await page.goto("/");

  const missing: string[] = [];

  for (const block of sectionBlocks()) {
    const id = block.match(/id: "([^"]+)"/)?.[1];
    if (!id) continue;

    // Lowercased: several of these tiers render through `text-transform:
    // uppercase`, and innerText returns the transformed text, so a
    // case-sensitive compare would flag every footnote in the deck.
    const rendered = (await page.locator(`#${id}`).innerText())
      .replace(/\s+/g, " ")
      .toLowerCase();

    // Quoted strings from the fields a layout can forget. Long enough to be
    // distinctive, short enough not to trip on a wrap or an injected
    // separator.
    const expected: string[] = [];
    const push = (raw?: string) => {
      if (!raw) return;
      const text = raw.replace(/\\"/g, '"').replace(/\s+/g, " ").trim().toLowerCase();
      if (text.length > 8) expected.push(text.slice(0, 40));
    };

    push(block.match(/\n {4}kicker:\s*\n?\s*"((?:[^"\\]|\\.)*)"/)?.[1]);
    push(block.match(/\n {4}footnote:\s*\n?\s*"((?:[^"\\]|\\.)*)"/)?.[1]);

    const strip = block.match(/strip: \{([\s\S]*?)\n {4}\}/)?.[1];
    if (strip) {
      push(strip.match(/label: "((?:[^"\\]|\\.)*)"/)?.[1]);
      for (const item of strip.matchAll(/^\s*"((?:[^"\\]|\\.)*)",?$/gm)) push(item[1]);
    }

    // The fifth tier a layout can omit. It appears on fourteen sections across
    // eight layouts, and two of those layouts rendered none of the tail fields
    // until it was added.
    const deeper = block.match(/deeper: \{([\s\S]*?)\n {4}\}/)?.[1];
    if (deeper) {
      for (const m of deeper.matchAll(
        /(?:label|claim|note): ?\n?\s*"((?:[^"\\]|\\.)*)"/g,
      )) {
        push(m[1]);
      }
    }

    // Every quoted string inside a matrix is a header or a cell. `"left"` and
    // `"right"` from `align` are shorter than push()'s floor, so they filter
    // themselves out.
    const matrix = block.match(/matrix: \{([\s\S]*?)\n {4}\}/)?.[1];
    if (matrix) {
      for (const m of matrix.matchAll(/"((?:[^"\\]|\\.)*)"/g)) push(m[1]);
    }

    // The loop slide's stage rows. The stage names are under the floor and are
    // counted by their own test below.
    const loop = block.match(/loopStages: \[([\s\S]*?)\n {4}\]/)?.[1];
    if (loop) {
      for (const m of loop.matchAll(/(?:produces|advances): "((?:[^"\\]|\\.)*)"/g)) {
        push(m[1]);
      }
    }

    for (const text of expected) {
      if (!rendered.includes(text)) missing.push(`${id}: "${text}"`);
    }
  }

  expect(missing, `registry copy that never reaches the page:\n${missing.join("\n")}`).toEqual(
    [],
  );
});

test("every GO DEEPER url reaches the page as a link", async ({ page }) => {
  // The text check above cannot detect this: a layout that renders the claim but
  // omits the anchors still passes it. A GO DEEPER strip describes a source and
  // then has to link to it.
  await page.goto("/");

  const missing: string[] = [];

  let checked = 0;

  for (const block of sectionBlocksWithUrls()) {
    const id = block.match(/id: "([^"]+)"/)?.[1];
    const deeper = block.match(/deeper: \{([\s\S]*?)\n {4}\}/)?.[1];
    if (!id || !deeper) continue;

    // Read the rendered hrefs once, then compare in JS. Interpolating a URL into
    // an attribute selector threw "Unsupported token BADSTRING", because `[^"]+`
    // matched across a newline where the formatter had wrapped the line. Comparing
    // values avoids CSS escaping.
    const rendered = new Set(
      await page.locator(`#${id} a`).evaluateAll((els) =>
        els.map((el) => el.getAttribute("href") ?? ""),
      ),
    );

    for (const m of deeper.matchAll(/href:\s*\n?\s*"([^"\s]+)"/g)) {
      checked++;
      if (!rendered.has(m[1])) missing.push(`${id}: ${m[1]}`);
    }
  }

  expect(missing, `GO DEEPER links that never reach the page:\n${missing.join("\n")}`).toEqual(
    [],
  );

  // Guards against the failure described above, where the test passed after
  // parsing zero links from fifteen strips.
  expect(checked, "no GO DEEPER links were parsed at all").toBeGreaterThan(14);
});

test("a section with steps renders all of them and marks the current one", async ({
  page,
}) => {
  // Counts nodes rather than matching text. The push() helper in the check above
  // discards strings of eight characters or fewer, and "Build", "Ship", "Run" and
  // "Test" are all shorter, so that check cannot see the step strip. Lowering the
  // threshold would cause ordinary footnote fragments to match by coincidence.
  await page.goto("/");

  const problems: string[] = [];

  for (const block of sectionBlocks()) {
    const id = block.match(/id: "([^"]+)"/)?.[1];
    const steps = block.match(/steps: \{([\s\S]*?)\n {4}\}/)?.[1];
    if (!id || !steps) continue;

    const list = (key: string) =>
      [
        ...(steps.match(new RegExp(`${key}: \\[([^\\]]*)\\]`))?.[1] ?? "").matchAll(
          /"([^"]+)"/g,
        ),
      ].map((m) => m[1]);

    const all = list("all");
    const current = list("current");

    // A step listed in `current` but not in `all` highlights nothing, and no type
    // can catch the typo.
    for (const step of current) {
      if (!all.includes(step)) problems.push(`${id}: current "${step}" is not in all`);
    }

    const rendered = await page.locator(`#${id} [data-steps] li`).count();
    if (rendered !== all.length) {
      problems.push(`${id}: ${all.length} steps in the registry, ${rendered} on the page`);
    }

    const lit = await page.locator(`#${id} [data-step="current"]`).allInnerTexts();
    if (lit.length !== current.length) {
      problems.push(
        `${id}: ${current.length} current steps, ${lit.length} marked on the page`,
      );
    }
  }

  expect(problems, problems.join("\n")).toEqual([]);
});

test("every matrix renders as many rows and columns as it declares", async ({ page }) => {
  // Guards the single-DOM approach in MatrixLayout. Rendering a table for desktop
  // and a separate card list for mobile duplicates every cell, which makes
  // innerText report each one twice and lets the content check pass while the
  // desktop table is broken. Counting rows detects that.
  await page.goto("/");

  const problems: string[] = [];

  for (const block of sectionBlocks()) {
    const id = block.match(/id: "([^"]+)"/)?.[1];
    const matrix = block.match(/matrix: \{([\s\S]*?)\n {4}\}/)?.[1];
    if (!id || !matrix) continue;

    const head = [
      ...(matrix.match(/head: \[([^\]]*)\]/)?.[1] ?? "").matchAll(/"([^"]*)"/g),
    ].map((m) => m[1]);

    // Rows are `[...]` groups inside `rows: [ … ]`, one per line group.
    const rowsBlock = matrix.match(/rows: \[([\s\S]*)\n {6}\],?/)?.[1] ?? "";
    const rows = [...rowsBlock.matchAll(/\[([\s\S]*?)\]/g)].map((m) =>
      [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((c) => c[1]),
    );
    if (rows.length === 0) continue;

    // `string[][]` cannot express "every row has as many cells as the header".
    const width = head.length || rows[0].length;
    for (const [i, row] of rows.entries()) {
      if (row.length !== width) {
        problems.push(`${id}: row ${i} has ${row.length} cells, expected ${width}`);
      }
    }

    const renderedRows = await page.locator(`#${id} tbody tr`).count();
    if (renderedRows !== rows.length) {
      problems.push(
        `${id}: ${rows.length} rows in the registry, ${renderedRows} on the page`,
      );
    }

    // One `th scope="row"` per row. The leading cell's weight comes from the
    // markup, so a change to a plain `td` would alter it without failing anything
    // else.
    const labels = await page.locator(`#${id} tbody tr th[scope="row"]`).count();
    if (labels !== rows.length) {
      problems.push(`${id}: ${rows.length} rows but ${labels} row labels`);
    }

    if (head.length > 0) {
      const renderedHead = await page.locator(`#${id} thead th`).count();
      if (renderedHead !== head.length) {
        problems.push(
          `${id}: ${head.length} headers in the registry, ${renderedHead} on the page`,
        );
      }
    }
  }

  expect(problems, problems.join("\n")).toEqual([]);
});

test("a matrix that declares a highlighted row renders it, and only it", async ({
  page,
}) => {
  // `matrix.highlight` is a plain number, so the content check cannot see it
  // and the row-count check cannot tell an emphasized row from the rest. A
  // layout that ignores the field would drop the emphasis with nothing
  // failing anywhere.
  await page.goto("/");

  const problems: string[] = [];
  let checked = 0;

  for (const block of sectionBlocks()) {
    const id = block.match(/id: "([^"]+)"/)?.[1];
    const matrix = block.match(/matrix: \{([\s\S]*?)\n {4}\}/)?.[1];
    const highlight = matrix?.match(/highlight: (\d+)/)?.[1];
    if (!id || highlight === undefined) continue;
    checked++;

    const marked = await page
      .locator(`#${id} tbody tr[data-highlight="true"]`)
      .count();
    if (marked !== 1) {
      problems.push(`${id}: ${marked} highlighted rows on the page, expected 1`);
      continue;
    }

    const attr = await page
      .locator(`#${id} tbody tr`)
      .nth(Number(highlight))
      .getAttribute("data-highlight");
    if (attr !== "true") {
      problems.push(`${id}: highlight declares row ${highlight}, another row is marked`);
    }
  }

  expect(checked, "no matrix declares a highlight").toBeGreaterThan(0);
  expect(problems, problems.join("\n")).toEqual([]);
});

test("the loop slide does not also carry a step strip", () => {
  // `loopStages` and `steps` hold the same six names and render completely
  // differently: one is a run of panels that occupies the slide, the other an 11px
  // indicator above the headline. A section with both would print the six words
  // twice.
  const offenders = sectionBlocks()
    .filter((block) => /\n\s{4}loopStages:/.test(block))
    .filter((block) => /\n\s{4}steps:/.test(block))
    .map((block) => block.match(/id: "([^"]+)"/)?.[1] ?? "unknown");

  expect(offenders, "a section carries both loopStages and steps").toEqual([]);
});

test("the loop slide renders every stage with both of its labels", async ({ page }) => {
  // Counts nodes rather than matching text: the six stage names are eight
  // characters or shorter, which the content check discards, so a layout that
  // dropped half the stages would pass it. The produces/advances strings are
  // covered by the content check; the counts below catch a stage rendered
  // with one of its two rows missing.
  await page.goto("/");

  const problems: string[] = [];
  let checked = 0;

  for (const block of sectionBlocks()) {
    const id = block.match(/id: "([^"]+)"/)?.[1];
    const loop = block.match(/loopStages: \[([\s\S]*?)\n {4}\]/)?.[1];
    if (!id || !loop) continue;
    checked++;

    const declared = [...loop.matchAll(/name: "/g)].length;
    const stages = await page.locator(`#${id} [data-loop-stage]`).count();
    const produces = await page.locator(`#${id} [data-produces]`).count();
    const advances = await page.locator(`#${id} [data-advances]`).count();

    if (stages !== declared) {
      problems.push(`${id}: ${declared} stages in the registry, ${stages} on the page`);
    }
    if (produces !== declared || advances !== declared) {
      problems.push(
        `${id}: ${produces} produces and ${advances} advances rows for ${declared} stages`,
      );
    }

    // The return arrow is drawn geometry plus a hardcoded label, so neither
    // the content check nor the counts above can see it — a refactor could
    // drop the entire band with nothing failing anywhere.
    const returns = await page.locator(`#${id} [data-loop-return]`).count();
    if (returns !== 1) {
      problems.push(`${id}: ${returns} return-arrow bands on the page, expected 1`);
    }
  }

  expect(checked, "no section declares loopStages").toBeGreaterThan(0);
  expect(problems, problems.join("\n")).toEqual([]);
});

test("a section that declares a chart renders its figure", async ({ page }) => {
  // The chart key is a bare string the content check cannot see, and the
  // chart layout renders its diagram through a switch — a key with no branch
  // renders an empty diagram column with nothing failing anywhere.
  await page.goto("/");

  const missing: string[] = [];
  let checked = 0;

  for (const block of sectionBlocks()) {
    const id = block.match(/id: "([^"]+)"/)?.[1];
    const chart = block.match(/\n {4}chart: "([^"]+)"/)?.[1];
    if (!id || !chart) continue;
    checked++;

    if ((await page.locator(`#${id} svg[role="img"]`).count()) === 0) {
      missing.push(`${id} declares chart "${chart}" and renders no figure`);
    }
  }

  expect(checked, "no section declares a chart").toBeGreaterThan(0);
  expect(missing, missing.join("\n")).toEqual([]);
});

test("a poll's system reveal points at one of its own options", () => {
  // `systemOptionId` is compared against option ids at render time, so a typo
  // means the band never mounts and the reveal shows two bare screens, with
  // nothing failing anywhere.
  const problems: string[] = [];
  let checked = 0;

  for (const block of sectionBlocks()) {
    const id = block.match(/id: "([^"]+)"/)?.[1];
    const poll = block.match(/poll: \{([\s\S]*?)\n {4}\}/)?.[1];
    const target = poll?.match(/systemOptionId: "([^"]+)"/)?.[1];
    if (!id || !poll || !target) continue;
    checked++;

    const optionIds = [...poll.matchAll(/\bid: "([^"]+)"/g)].map((m) => m[1]);
    if (!optionIds.includes(target)) {
      problems.push(`${id}: systemOptionId "${target}" matches no option`);
    }
  }

  expect(checked, "no poll declares a systemOptionId").toBeGreaterThan(0);
  expect(problems, problems.join("\n")).toEqual([]);
});

test("every section given a backdrop actually renders one", async ({ page }) => {
  // Media was the fourth registry field to be silently dropped by a layout that
  // did not know about it — after `strip`, `footnoteHref` and `brand`. Eight of
  // fourteen layouts ignored it, so assigning a backdrop to a claim or a poll
  // shipped the file in the bundle and put nothing on the screen. Nothing
  // failed: not the build, not a type, not a test.
  await page.goto("/");

  const missing: string[] = [];

  for (const block of sectionBlocks()) {
    const id = block.match(/id: "([^"]+)"/)?.[1];
    if (!id) continue;
    if (!/media: \{/.test(block)) continue;

    const isVideo = /video: /.test(block);
    const selector = isVideo ? `#${id} video` : `#${id} img`;
    if ((await page.locator(selector).count()) === 0) {
      missing.push(`${id} carries media and renders no ${isVideo ? "video" : "img"}`);
    }
  }

  expect(missing, missing.join("\n")).toEqual([]);
});
