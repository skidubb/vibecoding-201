# SPEC

The three-line spec for this repository, written in the form the class teaches. It is short
on purpose. If a change makes one of these three lines false, it needs a new spec rather
than a longer one.

## Job

Present the Vibecoding 201 argument as a single scrolling web page that Scott can walk a
beat at a time from the keyboard, and that a Pavilion attendee can read on their own
afterward without him narrating it.

## User

Two people, and the second is the harder case.

- **Scott Ewalt, presenting.** Laptop, Zoom screen share, driving with arrow keys.
- **A Pavilion attendee, months later.** Sent the link, no narration, possibly on a phone.

## Done

Open <https://crossing-the-gap-site.vercel.app> on a laptop and run these five steps. Another
person can run them without asking anyone a question.

1. Click any tick on the right-hand rail. The deck scrolls to that section.
2. With that tick still focused, press `→`. The deck advances to the next stop.
3. With a tick focused, press `Space`. The tick fires and the deck does not also jump a stop.
4. Press `→` repeatedly from the title through to the close. Every press moves the page.
5. Scroll to a light section. The fixed rail restyles to that section's theme.

`npm test` asserts all five against a production build. `tests/happy-path.spec.ts` is the
same checklist in executable form.

---

## Source data

Deck copy is literal: every word and image on the page is a literal in
`src/content/sections.ts` or a file in `src/assets/` and `public/media/`, and content
changes ship as a commit and a deploy. Live state is not: polls, tallies, spec submissions
and the event log read and write a Supabase Postgres project at run time
(`supabase/migrations/` is the schema), degrading to explicit offline messages when the
backend is absent.

## Access rules

The deck, `/vote`, `/report` and `/kit` are public. Voting signs a participant in
anonymously on first tap; `/signin` (Google or emailed link) exists for saving a spec,
requesting the kit, and presenting — auth cookies are set only for those who use it. What a
viewer can read is decided in Postgres: row-level security and column grants keep another
person's vote, an unshared spec, and an unrevealed answer unreadable regardless of what a
client asks for. `/admin` (the presenter console) and `/admin/export` answer only to an
account `is_admin()` recognises, and 404 for everyone else. Speaker notes are deliberately
absent; they live in the PPTX.

## Failure behavior

The page is static output from `next build`, so there is little surface to fail.

- **JavaScript unavailable or broken.** Every section is server-rendered, and all twelve
  section headings are present in the initial HTML. The reader loses smooth scroll,
  parallax, and the presenter keys. They keep the argument.
- **A video fails to load.** Each clip has a poster frame beside it in `public/media/`, and
  the section reads without either.
- **The build fails.** Vercel keeps serving the last successful production deployment.
- **A presenter key press goes nowhere.** This has happened. Stops derive from scrollable
  overshoot rather than section height for that reason, and `tests/happy-path.spec.ts`
  fails if any key press stops moving the deck.

## Non-goals

Named so they do not get built by accident.

- **Not a CMS.** There is no editing surface and there will not be one. Content is a
  TypeScript file reviewed in a diff.
- **Not multi-tenant.** One deck, one audience, no accounts, no per-viewer state.
- **Not a replacement for the PPTX.** PowerPoint holds the speaker notes and is the offline
  fallback. If this site is down, the class still runs.
- **Not the whole deck.** Twelve sections, and they come from the superseded *Crossing the
  Gap* deck rather than the current one. See `OWNERSHIP.md`.
- **Not a phone presenting surface.** The progress rail is hidden below the `md` breakpoint.
  Reading on a phone works; driving from one does not.
