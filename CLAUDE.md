@AGENTS.md
@README.md

# Working in this repo

The README above is the source of truth for architecture and commands. These are the
operational rules that don't belong in it.

- **Titles come from the deck, verbatim.** If you find yourself writing a title, stop —
  you are decorating, and it reads as hiding the point. Every eyebrow, headline, body
  line and kicker in `src/content/sections.ts` is quoted from
  `../Vibecoding-201-Production-GTM-Tools-v6.pptx`; the deck's slide numbering and
  speaker notes are noise and are deliberately not mirrored anywhere on the site.
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
