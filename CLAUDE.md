@AGENTS.md
@README.md

# Working in this repo

The README above is the source of truth for architecture and commands. These are the
operational rules that don't belong in it.

- **No metaphors, in slide copy or in comments. This rule overrides verbatim.** On
  2026-07-29 Scott listed five phrases to remove: "Four questions before you climb", "Grade
  what you already built", "Which rung is it on today?", "Then the four questions. Yes or
  no.", and "Score the thing you graded at the start". Each was quoted accurately from
  `../deck-content-v7.md` (now superseded by v8), so the verbatim rule is what kept them in. Two separate problems
  were involved:
  - **Terms that only make sense inside this deck**: rungs, climbing, doors, harnesses,
    crossing. Write what the thing actually is.
  - **Lines that refer to something not on the slide.** "Then the four questions" appeared
    on a slide showing no questions; they were on the previous slide. "This is Thursday,
    repaired" appeared sixteen slides after Thursday. Repeat the content the line depends
    on, even when that duplicates an earlier slide.
  Do not restore any of this to match the outline. If a later outline reintroduces it,
  rewrite it and note the change.
- **Write comments as plain technical prose.** State the mechanism and the failure it
  prevents. No aphorisms, no "not X but Y" constructions, no closing epigram. Comments in
  this repo were rewritten once for this reason; match the current style rather than the git
  history.
- **Titles come from the deck, verbatim**, subject to the two rules above. If you find
  yourself writing a title, stop —
  you are decorating, and it reads as hiding the point. Every eyebrow, headline, body
  line, table cell and kicker in `src/content/sections.ts` is quoted from
  `../deck-content-v12.md` (28 sections; v7 through v11 and the earlier 40-section
  `../Vibecoding-201-Production-GTM-Tools-v6.pptx` cut are superseded). The deck's slide
  numbering and speaker notes are noise and are deliberately not mirrored anywhere on the site.
- **The registry follows the deck's four rules:** the deck teaches on its own, so anything
  the audience must learn is printed (inverted in v11 — v10 and earlier kept spoken lines
  off the slide, and NOTES blocks are commentary Scott does not present from); no sentence
  restates the one before it; every headline has to make sense with the rest of the slide
  covered; and (new in v8) every slide stands on its own: no line may depend on another
  slide's content, and a line that needs it repeats it.
- **The GO DEEPER strip is on 16 of the 28 sections.** The other 12 are the polls, the
  timers and the demo, where the room is talking rather than reading. Do not add strips to
  complete the set.
- **`SectionTail` renders `strip`, `kicker`, `footnote` and `deeper`** so each layout has one
  call site instead of four. Five registry fields have been dropped by layouts that did not
  handle them. Add any new tier there rather than in twelve components, and extend
  `tests/registry-integrity.spec.ts` in the same commit.
- **Short registry fields need a test that counts nodes, not one that matches text.** The
  content check discards strings of eight characters or fewer, so "Build", "Ship", "Run" and
  "Test" are invisible to it. Lowering the threshold causes false matches on footnote
  fragments.
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
