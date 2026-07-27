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
function sectionBlocks(): string[] {
  const start = SOURCE.indexOf("export const sections");
  const body = SOURCE.slice(start);
  return body
    .split(/\n  \{\n/)
    .slice(1)
    .map((block) => block.split(/\n  \},?\n/)[0]);
}

test("a poll section gives nothing away before the reveal", () => {
  // A poll's debrief is the answer in prose. It lives in Postgres behind a
  // column grant and arrives only once the presenter reveals, so the registry
  // must not carry any commentary alongside the question — a kicker under a
  // live poll is on screen while the room is still voting.
  //
  // This is not hypothetical: the first version of the debugging poll shipped
  // with "the trap is believing you have to read the code yourself" under the
  // options, which rules out D and points at C before a single vote is cast.
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
  // That is not hypothetical. `strip` was added to the cards and claim
  // layouts, and Jordan's three authorization rules — which live on a split
  // layout — stopped appearing at all. The build passed, every test passed,
  // and the rules were simply gone from the slide.
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

    for (const text of expected) {
      if (!rendered.includes(text)) missing.push(`${id}: "${text}"`);
    }
  }

  expect(missing, `registry copy that never reaches the page:\n${missing.join("\n")}`).toEqual(
    [],
  );
});
