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
