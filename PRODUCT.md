# PRODUCT

## What this is

A single-page, scroll-driven web version of the Vibecoding 201 deck for Pavilion's AI in GTM
School. Twelve sections, each one a chapter of the argument, walked with arrow keys or read
with a scroll wheel.

It is a companion to the class. The PPTX remains the presenting surface and holds the
speaker notes. A bug in this site should be an embarrassment, not a dead class.

## Who it serves

**Scott, presenting.** Laptop, Zoom screen share, arrow keys. He needs the deck to land on a
readable frame on every key press and never on a half-scrolled seam. Sections taller than
the viewport get several stops, so a scroll-drawn chart can be walked a beat at a time
instead of scrubbed mid-sentence.

**Someone who finds the link cold, months later.** No narration, no context, possibly a
phone. This is the harder audience and the one that shapes most of the writing. Every
section has to carry its own point in its heading and lede, because there is nobody in the
room explaining it. The six-day timeline of Jordan, VP RevOps, whose churn-risk prototype
dies between Sunday and Friday, is the through-line that lets the page read without a
narrator.

## What it deliberately does not do

- **No sign-in, no accounts, no stored state.** Nothing to log into, and nothing kept about
  a visitor.
- **No content management.** Sections are entries in `src/content/sections.ts`. Editing
  means a commit, a review, and a deploy.
- **No speaker notes.** They stay in the PPTX, where Scott reads them on a second screen.
- **No presenting from a phone.** The rail is hidden below the `md` breakpoint. Reading on a
  phone works.
- **No analytics, no tracking, no cookies.** See below for what that costs.

## How to tell whether it is working

There is no instrumentation in this app, so every signal below is observed rather than
measured. That gap is deliberate for now: adding analytics means adding a consent story to a
page that currently sets no cookies at all.

**During a class.** Scott gets through the deck without a key press that goes nowhere and
without narrating around a section that failed to render. Attendees ask about the argument
rather than about the site.

**After a class.** Somebody opens the link who was not in the room. The strongest evidence
available today is people quoting a specific section back, rather than saying the deck
looked good.

**As an artifact.** Slide 18 of the deck argues that a repository should carry a harness of
files explaining it. An attendee who opens this repo should find that claim true rather than
aspirational. `SPEC.md`, `PRODUCT.md`, `OWNERSHIP.md`, `README.md`, `CLAUDE.md`, and
`AGENTS.md` are here. `ARCHITECTURE.md`, `DATA_MODEL.md`, `SECURITY.md`, and `.env.example`
are not. Anyone counting will notice, so the gap is stated here instead of hidden.

**As a build.** `npm run build` type-checks, and `npm test` runs five Playwright specs
against a production build. Both have to pass before anything ships. Passing does not mean
the page reads well; that still takes a person looking at it.
