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

None. Every word, number, and image on the page is a literal in `src/content/sections.ts`
or a file in `src/assets/` and `public/media/`. The page makes no network request at run
time and reads no database. Content changes ship as a commit and a deploy.

## Access rules

Public and unauthenticated. Anyone with the URL sees all of it, there is nothing to sign
into, and the server keeps no per-viewer state. Production sets no cookies. Nothing on the
page is confidential, so this is the intended setting rather than a control that has not
been built yet. Speaker notes are deliberately absent; they live in the PPTX.

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
