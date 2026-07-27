/**
 * Every outbound URL in the deck, fetched.
 *
 * The Bar claims nine things about this repository and links to the evidence
 * for each. A dead link there is worse than not making the claim: it is a
 * verification failure, on the slide about verification, in front of the room.
 * Four URLs an earlier draft carried had already moved by the time anyone
 * checked, so this checks rather than trusts.
 *
 * Kept out of the Playwright suite deliberately — that suite must be
 * deterministic and offline. This one needs the network and belongs in the
 * pre-class checklist.
 *
 *   npm run links
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(process.cwd(), "src/content/sections.ts"), "utf8");
const urls = [...new Set([...source.matchAll(/https?:\/\/[^\s"'`)]+/g)].map((m) => m[0]))]
  .filter((u) => !u.includes("localhost") && !u.includes("127.0.0.1"))
  .sort();

if (urls.length === 0) {
  console.error("No URLs found — has the registry moved?");
  process.exit(1);
}

console.log(`\nchecking ${urls.length} links\n`);

let bad = 0;
await Promise.all(
  urls.map(async (url) => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20_000);
      // GET rather than HEAD: several docs hosts answer HEAD with 403 or 405
      // while serving the page perfectly well, which reads as a dead link.
      const res = await fetch(url, { redirect: "follow", signal: controller.signal });
      clearTimeout(timer);
      const moved = res.url.replace(/\/$/, "") !== url.replace(/\/$/, "");
      if (!res.ok) bad += 1;
      console.log(
        `  ${res.ok ? "ok " : "DEAD"}  ${String(res.status)}  ${url}` +
          (res.ok && moved ? `\n            now: ${res.url}` : ""),
      );
    } catch (error) {
      bad += 1;
      console.log(`  DEAD  ---  ${url}  (${error.name})`);
    }
  }),
);

console.log(bad === 0 ? "\nall resolve\n" : `\n${bad} need attention\n`);
process.exit(bad === 0 ? 0 : 1);
