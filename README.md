# Vibecoding 201 — companion site

A neumorphic, parallax-scrolling presentation of *Vibecoding 201: Building Production
GTM Tools* (Pavilion AI in GTM School) — the polls, the copyable prompts, and the tool
the class is about, deployed for real. The site is the presentation surface, not a
companion: all 40 sections of `Vibecoding-201-Production-GTM-Tools-v6.pptx` are on the
page, with every title quoted from the deck verbatim. See `SPEC.md` for what this is
meant to do and `ARCHITECTURE.md` for why it is built this way.

**Live:** https://crossing-the-gap-site.vercel.app

## Running it

```bash
npm run dev      # http://localhost:3000
npm run build    # production build; type-checks, so a type error fails it
npm test         # Playwright, against a production build
```

Both are verification gates and neither replaces the other: `build` proves it
compiles, `test` proves a presenter can drive it. There is no lint script —
`next lint` was removed in Next 16 and nothing has replaced it here yet.

`npm test` builds and starts the app itself. It deliberately never reuses a
running server, because a surviving `next start` serves the previous build and
a source change would silently not be under test. It also does not run against
`next dev`: dev mode's HMR socket fails under Playwright and takes hydration
with it, which turns every interaction assertion into a false negative.

The two asset scripts (`gen:media`, `assets`) are documented under
[Assets](#assets).

## Presenting

- **→ / ↓ / Space** next stop, **← / ↑** previous, **Home / End** jump to ends
- Space is the one key a focused control keeps, so it activates a rail tick
  rather than advancing. Arrows work everywhere, including while a tick holds
  focus — losing them after a click would strand the presenter mid-talk
- Sections with room to scroll get multiple stops automatically, so the
  scroll-drawn charts can be walked a beat at a time instead of scrubbed with
  the wheel mid-sentence. Stops come from a section's scrollable overshoot, not
  its height: every stop is somewhere the deck can actually travel to, so no
  key press is ever a no-op
- The right-hand rail is clickable; the bottom-left readout shows position in
  this deck (`7 / 40`) and nothing else — the source deck's numbering is
  deliberately not mirrored

**`/admin` is the presenter console, and the one URL worth remembering.**
Signed out it routes through `/signin` and comes back; signed in as anyone but
an admin it is indistinguishable from a URL that does not exist. It shows every
poll with per-option live counts and open/close/reveal controls that work from
anywhere, the shared submissions with "put it on screen", the event analytics
and log, and the CSV exports. `/kit` and `/report` both carry a small
Presenter link for the day the URL is forgotten.

The presenter bar appears bottom-right on **every** section for an account the
database answers `is_admin()` for — the Presenter chip is the standing proof of
being signed in, and links to the console. The controls join it on the two
kinds of section that have live state. Keys are all Shift-modified, because
bare letters would collide with the deck's own navigation:

- On a poll — **Shift-O** open, **Shift-C** close, **Shift-R** reveal. The
  readout carries the tally, the number of distinct accounts behind it, and
  the per-option counts; Refresh re-reads if a websocket quietly dropped
- On the spec exercise — **Shift-S** opens the panel of submissions the room
  has shared. Nothing an author kept private is readable from that account, so
  the panel cannot show it even by mistake. "Put it on screen" sets
  `surfaced_at`, which is what the section renders to everyone
- An admin also sees every poll's bars before the reveal, labelled "Presenter
  preview" — decide whether the projector should be a signed-in browser, or
  present signed out and drive from `/admin`

## Adding a section

Everything is driven by one registry: `src/content/sections.ts`. A new section is a
new entry — code is only needed for a genuinely new layout shape. Titles come from
the deck, verbatim; if you find yourself writing one, stop.

```ts
{
  id: "the-bar",
  theme: "dark",          // flips every neumorphic surface beneath it
  layout: "cards",        // hero | split | claim | cards | timeline | chart | loop | cta | prompt | poll | exercise
  eyebrow: "The bar",
  title: "A production standard.",
  accent: "production standard.",   // rendered in magenta
  cards: [{ title: "Persistent data" }],
}
```

Layout components are registered in `src/components/Deck.tsx` (`LAYOUTS`).

## Architecture notes

- **One scroll pipeline.** Lenis animates native `scrollTop`, so Motion's
  `useScroll` stays accurate and presenter jumps reuse the same mechanism as the
  wheel. Never add CSS `scroll-behavior: smooth` — it fights Lenis.
- **Themes are CSS variables**, flipped by `[data-theme]` on each section
  (`src/app/globals.css`). Neumorphic classes (`.neu-raised`, `.neu-inset`) read
  their shadows from those vars, so no component needs a theme prop.
- **Chart sections are tall with a sticky stage.** Their `SectionShell` must not
  set `overflow-hidden` — that would make the section a scroll container and
  silently break `position: sticky`.
- **Backdrops must be siblings of the content container**, never inside it, or
  they inherit its max-width and padding instead of going full-bleed.
- **Chart colors are stepped per theme**, not flipped. Both pairs pass the
  dataviz six-check validator (CVD ΔE 22.6, contrast >= 3:1) against their own
  surface: `#8E7BEF`/`#DF285B` on navy, `#6B57D8`/`#C41E4E` on lavender.

## Assets

Two stages. Generation is optional — stage 2 alone still processes the original
Midjourney renders in `../images/`.

```bash
npm run gen:media   # prompts -> raw renders in IMAGES-REVIEW/<folder>/
npm run assets      # raw renders -> src/assets/*.webp and public/media/*.mp4
```

Both take the same `--manifest` flag, and both default to `site`. They are two
halves of one pipeline, so a flag passed to one and not the other means stage 2
reads an empty directory and reports nothing to do:

```bash
npm run gen:media -- --manifest deck-v6   # -> IMAGES-REVIEW/deck-v6/
npm run assets   -- --manifest deck-v6    # -> src/assets/generated/
```

**Stage 1 — generate.** `scripts/generate-media.mjs` calls Vercel AI Gateway,
which reaches both modalities through one credential: stills with Seedream 5.0
Pro (`bytedance/seedream-5.0-pro`), clips with Gemini Omni Flash
(`google/gemini-omni-flash-preview`). Seedream won the adherence bake-off in
`scripts/bakeoff.mjs` — it was the only model that landed every colour binding
and left the wall above the group clear for a headline. It also stamps "AI
generated" into the bottom-right corner, which `WATERMARK_TRIM` crops. Every
prompt lives in
`scripts/media.manifest.mjs`, keyed by the same semantic name the deck imports,
so an asset can be revised by editing its prompt instead of reconstructing what
was once typed into a chat window.

> **All asset prompts derive from `../pavilion-brand.json`.** The manifest reads
> the brand file at run time and composes the shared style block from it —
> palette, lighting, architectural space, posture, mood, gender balance. Never
> retype brand language into a prompt by hand; edit the brand file and every
> prompt follows. Hand-written style direction is what produced off-brand
> renders: an invented "desaturated, faces turned away" line contradicted the
> brand's own "saturated pink interrupts authoritative midnight blue" and
> "direct eye contact", and the output looked like a factory floor instead of a
> members' club.

```bash
npm run gen:media -- --only agent-a     # one asset
npm run gen:media -- --images           # stills only (--videos for clips)
npm run gen:media -- --force            # regenerate over existing files
```

Existing files are skipped unless `--force`, because video costs real money and
takes minutes per clip.

The credential comes from 1Password at run time via `op run` — `.env.op` holds
the reference `op://Dev/Vercel AI Gateway/credential`, not the secret, so no key
lands on disk. Requires `op signin`.

Things worth knowing before you run it:

- **Video needs a $10 minimum AI Gateway balance.** Below that the gateway
  returns 402 and only the image half works. A clip takes 30–70s.
- **Both defaults are multimodal Gemini models**, typed `language` in the
  gateway catalog. They are called with `generateText` and return media in
  `result.files` — not through `generateImage`/`experimental_generateVideo`.
  The script handles both call surfaces, so a `model:` override in the manifest
  still works for Imagen, Veo or Flux (see `TEXT_SURFACE` in the script).
- **Aspect ratio is a request, not a guarantee.** `bfl/flux-2-pro` ignores both
  `aspectRatio` and its own width/height provider options through the gateway,
  silently returning 1024x1024. The script measures every render and flags any
  whose ratio is off, so this can't pass unnoticed again.
- Models still render **garbled text on screens and signage** despite the "no
  text" instruction. Harmless at backdrop opacity, worth a glance.

**Stage 2 — optimize.** `scripts/optimize-assets.mjs` reads both sources: the
Midjourney exports in `../images/` (matched by filename fragment, written to
`src/assets/`) and anything in `scripts/.generated/` (already semantically
named, written to the `generated/` subdirectories). Stills become 2560w-capped
webp at ~45KB.

To use a generated asset in the deck, import it explicitly:

```ts
import agentA from "@/assets/generated/agent-a.webp";   // instead of @/assets/agent-a.webp
// videos: "/media/generated/workflow-loop.mp4"
```

> **Generated output is additive and never overwrites hand-made art.** It goes
> to `src/assets/generated/` and `public/media/generated/`, so a generated
> `agent-a` sits beside the Midjourney `agent-a` instead of replacing it — the
> names collide but the directories don't. The deck keeps rendering the
> Midjourney art until you deliberately point a section at a generated file. Clips are encoded to match the deck's originals — h264, 24fps,
yuv420p, no audio track, crf 28 — plus a poster frame. 1600w is a ceiling, not a
target, so Veo's 720p output is never upscaled. Baked-in letterbox bars are
detected and cropped automatically (Veo returns 2.34:1 content inside a 16:9
frame, and these are full-bleed backdrops). Videos lazy-load and only play while
on screen.
