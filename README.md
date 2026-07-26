# Crossing the Gap — parallax presentation

A neumorphic, parallax-scrolling web version of `Vibecoding-201-Crossing-the-Gap.pptx`
(Pavilion AI in GTM School). This prototype covers 12 representative sections of the
44-slide deck and establishes the full design system.

**Live:** https://crossing-the-gap-site.vercel.app

## Running it

```bash
npm run dev      # http://localhost:3000
npm run build    # production build, and the only verification gate — it type-checks
```

There is no test or lint script. The two asset scripts (`gen:media`, `assets`) are
documented under [Assets](#assets).

## Presenting

- **→ / ↓ / Space** next stop, **← / ↑** previous, **Home / End** jump to ends
- Sections taller than the viewport get multiple stops automatically, so the
  scroll-drawn charts and the six-day timeline can be walked a beat at a time
  instead of scrubbed with the wheel mid-sentence
- The right-hand rail is clickable; the bottom-left readout shows position and
  the source deck's slide number

## Adding the remaining slides

Everything is driven by one registry: `src/content/sections.ts`. A new slide is a
new entry — code is only needed for a genuinely new layout shape.

```ts
{
  id: "the-bar",
  slide: "37",
  theme: "dark",          // flips every neumorphic surface beneath it
  layout: "cards",        // hero | split | claim | cards | timeline | chart | loop | cta
  eyebrow: "The bar",
  title: "The minimum production standard.",
  accent: "production standard.",   // rendered in magenta
  cards: [{ label: "01", title: "An explicit job and user" }],
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
npm run gen:media   # prompts -> raw renders in scripts/.generated/
npm run assets      # raw renders -> src/assets/*.webp and public/media/*.mp4
```

**Stage 1 — generate.** `scripts/generate-media.mjs` calls Vercel AI Gateway,
which reaches both modalities through one credential: stills via `generateImage`
(Imagen 4), clips via `experimental_generateVideo` (Veo 3.1). Every prompt lives
in `scripts/media.manifest.mjs`, keyed by the same semantic name the deck
imports, so an asset can be revised by editing its prompt instead of
reconstructing what was once typed into a chat window.

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

Two gateway constraints worth knowing before you run it:

- **Video needs a $10 minimum AI Gateway balance.** Below that the gateway
  returns 402 and only the image half works.
- **Imagen, not Flux, is the default image model.** `bfl/flux-2-pro` accepts
  `aspectRatio` through the gateway, warns about nothing, and returns 1024x1024
  regardless — its `width`/`height` provider options are ignored too. The script
  measures every render and flags one whose aspect ratio doesn't match.

**Stage 2 — optimize.** `scripts/optimize-assets.mjs` reads both sources: the
Midjourney exports in `../images/` (matched by filename fragment) and anything
in `scripts/.generated/` (already semantically named). Stills become 2560w-capped
webp at ~45KB. Clips are encoded to match the deck's originals exactly — h264,
1600w, 24fps, no audio track, crf 28 for ~1450 kbps — plus a poster frame. Videos
lazy-load and only play while on screen.
