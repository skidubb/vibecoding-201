# Architecture

`README.md` is the source of truth for how the app is laid out and how to run it.
This file has a different job: the decisions behind that layout, and why each one
is the way it is. If the two ever disagree, the README describes the code and
this file describes the intent — fix whichever is stale.

Every constraint below was paid for. They are written down so the next change
does not quietly undo one.

## Content is data, not components

`src/content/sections.ts` is a single registry of `Section` objects.
`src/components/Deck.tsx` maps each entry's `layout` to one of eight components.
Adding a slide means adding a registry entry; only a genuinely new visual shape
needs code.

This exists because the deck is rewritten far more often than it is restyled.
The alternative — a component per slide — makes reordering a refactor and makes
"change this line" a code review. The cost is that the registry's payload fields
are optional on a shared type, so nothing forces a `cards` section to actually
carry cards. Each layout guards with `?.`. If the registry grows much past its
current size, that trade stops paying and the type should become a discriminated
union on `layout`.

## One scroll pipeline

Lenis animates native `scrollTop`. Motion's `useScroll` reads that same value,
and presenter jumps call the same Lenis instance the wheel does. There is
exactly one thing moving the page.

The failure this avoids is two smoothing systems fighting: a CSS
`scroll-behavior: smooth` or a `scrollIntoView` will interleave with Lenis and
produce a scroll position that stutters and a `useScroll` progress value that
lies, which desynchronises every scroll-driven animation on the page.
`globals.css` pins `scroll-behavior: auto` with a comment for this reason.
**Never add smooth scrolling in CSS, and route programmatic jumps through
`goToIndex` / `goToStop` rather than the DOM.**

## Presenter stops are measured, not declared

`src/lib/stops.ts` reads live element heights and splits any section with real
scrollable overshoot into up to four stops, so the scroll-drawn charts can be
walked a beat at a time instead of scrubbed with the wheel mid-sentence.

Stops derive from **overshoot**, not from raw height. Deriving them from height
gave any section exactly one viewport tall two stops that resolved to the same
scroll position: the presenter pressed the arrow key and nothing moved, starting
on the title slide and repeating once per full-height section. A stop must be
somewhere the deck can actually travel to.

Because heights are measured rather than declared, anything that changes a
section's height after mount invalidates the grid. `DeckProvider` rebuilds on
resize and on a debounced `ResizeObserver`, and exposes `recompute()` for
components that know they just grew. Interactive components should still
reserve fixed height for their output rather than relying on the observer.

## Themes are CSS variables, flipped per section

Each section carries `[data-theme]`; the neumorphic classes read their surfaces
and shadows from variables under that attribute. **No component takes a theme
prop**, which is what keeps a two-theme deck from becoming a two-variant
component library.

Anything `position: fixed` sits outside every section and therefore inherits
nothing, which is why the progress rail once hardcoded lavender and magenta and
only looked correct on dark chapters. `DeckChrome` re-declares the active
section's theme at the top of the tree so fixed UI styles itself from the same
variables a panel does. **Fixed UI belongs inside `#deck-chrome` and must not
hardcode a colour.**

## Backdrops are siblings of the container

`CONTAINER` is `max-w-[1200px]` with horizontal padding. A backdrop nested
inside it inherits both and stops being full-bleed. Image, video, and glow
layers are siblings of the container, never children.

Parallax is transform-only. The deck is presented over a screenshare, and
transforms stay on the compositor where a layout-affecting animation would not.

## Tall sections opt in explicitly

`TALL_LAYOUTS` in `Deck.tsx` lists the layouts that manage their own geometry —
currently only `chart`. `tall` strips `min-h-screen`, vertical centering,
padding **and** `overflow-hidden` from the shell, so a layout only belongs in
that set if it supplies all four itself. The `overflow-hidden` part is the
subtle one: leaving it on makes the section a scroll container, which silently
breaks the `position: sticky` stage the scroll-drawn charts depend on.

## Two gates, and what each one can prove

`npm run build` type-checks. `npm test` runs Playwright against a **production
build**, not `next dev` — dev mode's HMR socket fails under Playwright and takes
hydration down with it, which turns every interaction assertion into a false
negative.

Playwright never reuses a running server. A surviving `next start` serves the
previous build, so a source change is silently not under test; that once let a
deliberately broken keyboard guard pass its own regression test.

A regression test is only accepted after it has been observed failing against
the code it guards. Both current ones were.

## Assets are generated out of band

Two stages, both outside the build: prompts to raw renders, then raw renders to
compressed `webp` and `mp4`. Prompts compose from `../pavilion-brand.json` at
run time rather than being retyped, because hand-written style direction is what
produced off-brand output before — an invented line contradicted the brand
file's own palette and posture rules and nobody noticed until the renders came
back wrong.

Raw renders stay out of git. Only the compressed derivatives the build consumes
are committed. Generated output is additive and never overwrites hand-made art;
a section keeps rendering the original until an import is deliberately changed.

## Secrets

`.env.op` holds 1Password references, not values, and is committed on purpose.
Anything needing a real credential runs under `op run`. `.env.example` lists
names only. `.gitignore` ignores `.env*` and re-admits exactly those two files.

Only the asset pipeline needs a credential today. `npm run dev` and
`npm run build` need none.

## The backend

This document's earlier claim that no backend exists is no longer true. The
site now has: a Supabase Postgres project (schema in `supabase/migrations/`,
eight migrations) with Google OAuth and anonymous sign-ins; live polls and the
spec exercise writing through RLS and definer RPCs; an `events` log; the
`/admin` presenter console and `/admin/export` CSV route, both gated by
`is_admin()` asked of the database; and Vercel Web Analytics for traffic. The
deck itself is still a static document served from the CDN — the proxy matcher
deliberately excludes `/` so two hundred simultaneous opens cost one cached
page.

`DATA_MODEL.md` and `SECURITY.md` — the two remaining files from the deck's
six — are still absent. When they had no schema to describe that was
deliberate; the schema now exists, so they are the known gap, not a choice.
