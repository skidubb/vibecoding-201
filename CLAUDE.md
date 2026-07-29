@AGENTS.md
@README.md

# Working in this repo

The README above is the source of truth for architecture and commands. These are the
operational rules that don't belong in it.

- **Titles come from the deck, verbatim.** If you find yourself writing a title, stop —
  you are decorating, and it reads as hiding the point. Every eyebrow, headline, body
  line, table cell and kicker in `src/content/sections.ts` is quoted from
  `../deck-content-v7.md` (26 sections; the earlier 40-section cut came from
  `../Vibecoding-201-Production-GTM-Tools-v6.pptx`). The deck's slide numbering and
  speaker notes are noise and are deliberately not mirrored anywhere on the site.
- **v7's own three rules govern the registry**, and they are why this file looks sparser
  than the talk: if it is said out loud it is not printed, no sentence restates the one
  before it, and every headline has to stand on its own with the slide covered up. A
  spoken punchline added to a slide is a regression even though nothing fails.
- **The GO DEEPER strip is on 14 of the 26, and absent from 12 on purpose.** A pointer on
  a poll, a timer or the demo is filler, and filler in that slot teaches the room to stop
  reading the slot. Do not "finish" the set.
- **Four optional tiers render through one `SectionTail`.** `strip`, `kicker`, `footnote`
  and `deeper` have one call site per layout, not four. Five registry fields have now been
  silently dropped by a layout that did not know about them — add a new tier there, not in
  twelve components, and extend `tests/registry-integrity.spec.ts` in the same commit.
- **Short registry fields need a structural test, not a text one.** The drop-guard
  discards strings of eight characters or fewer, so "Build", "Ship", "Run" and "Test" are
  invisible to it. Do not lower that floor — count the rendered nodes instead.
- **`AGENTS.md` is generated.** Never hand-edit between the `BEGIN/END:nextjs-agent-rules`
  markers — a tool regenerates that block and will clobber anything added there. Durable
  rules go in the README, or here.
- **Two gates, and there is no lint script.** `npm run build` runs TypeScript, so a type
  error fails it. `npm test` runs Playwright against a *production* build — `next dev`'s
  HMR socket fails under Playwright and takes hydration with it, so dev-mode runs report
  false negatives on every interaction. Never claim a change works without running both.
- **A regression test is not accepted until it has been seen failing** against the code it
  guards. Two in `tests/` were, and one earlier version passed against a deliberately
  broken guard because a stale `next start` was still serving the previous build.
- **Never scope a locator by the text under test.** `getByRole("button", { name: "Copy" })`
  stops matching the instant the label becomes "Copied", and the assertion then waits on an
  empty locator and reports working behaviour as broken. This cost hours and produced a
  whole component built on the wrong diagnosis. Poll options change their label on click
  too — locate by role, or by a `data-` attribute that does not change.
- **A policy that permits an UPDATE permits every column of it.** RLS gates rows,
  not fields, so "the author may edit their own submission" also meant "the author
  may set `surfaced_at`" — the column the deck reads to decide what to render to
  the whole room. Whenever an attendee can write a row, ask the second question
  as well: not just who can read it, but who can put it on a screen. The check
  constraint that looked like it covered this only enforced ordering.
- **Secrets resolve through 1Password, never inline.** `.env.op` holds `op://` pointers only
  and is intentionally committed. Anything needing a real key goes through
  `op run --env-file=.env.op -- …` (see `npm run gen:media`), which requires `op signin`.
- **Deploy target** is the Vercel project `crossing-the-gap-site`
  (`.vercel/project.json`). Confirm before deploying — do not infer the target from the
  directory name.
- **Raw renders in `../images/` and `scripts/.generated/` stay out of git.** Commit the
  compressed derivatives in `src/assets/` and `public/media/` that the build consumes.
