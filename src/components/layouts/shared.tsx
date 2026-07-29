"use client";

import type { Section } from "@/content/sections";
import { AccentTitle, NeuBadge, Reveal } from "@/components/neu/Neu";
import { ImageBackdrop, VideoBackdrop } from "@/components/core/ParallaxLayer";
import { logEvent } from "@/lib/events";

export type LayoutProps = { section: Section; index: number };

/**
 * The section's backdrop, if it was given one.
 *
 * Eight of the fourteen layouts used to ignore `media` outright, so assigning a
 * backdrop to a claim or a poll put a file in the bundle and nothing on the
 * screen — the same silent drop that has now cost this deck `strip`,
 * `footnoteHref` and `brand`. One helper means adding a backdrop to a layout is
 * one line rather than an import, a conditional and a set of remembered
 * defaults, and `tests/registry-integrity.spec.ts` fails if any section
 * carrying media renders no image.
 *
 * Must stay a sibling of the content container — `absolute inset-0` resolves
 * against the nearest positioned ancestor, and the container is narrower and
 * padded. Every caller renders it before `<div className={CONTAINER}>`.
 */
export function SectionBackdrop({
  section,
  opacity,
  ...rest
}: {
  section: Section;
  opacity?: number;
  focal?: string;
  sideScrim?: "left" | "right";
  preload?: boolean;
}) {
  const media = section.media;
  if (!media) return null;

  if (media.video) {
    return (
      <VideoBackdrop src={media.video} poster={media.poster} speed={media.speed} />
    );
  }
  if (!media.image) return null;

  return (
    <ImageBackdrop
      src={media.image}
      speed={media.speed}
      opacity={opacity ?? (section.theme === "dark" ? 0.3 : 0.24)}
      scrim={section.theme}
      {...rest}
    />
  );
}

/**
 * Spec → Plan → Build → Test → Ship → Run, with the current step lit.
 *
 * Five slides are stages of one loop, and before this existed they carried
 * "STEP 1 OF 6" against a loop the deck introduced on a slide that had been cut
 * in a merge — a reference to nothing. A strip that always prints all six steps
 * cannot go stale that way: the map is on every slide that claims a position on
 * it.
 *
 * `--text-faint` is correct for the inactive steps and is the one place in this
 * file it is. These are chrome, the same category as the eyebrow above them, not
 * body copy — do not "fix" this against `tests/contrast.spec.ts`.
 */
export function StepStrip({
  steps,
  centered = false,
}: {
  steps: NonNullable<Section["steps"]>;
  centered?: boolean;
}) {
  const current = new Set(steps.current);
  return (
    <Reveal delay={0.04}>
      <ol
        data-steps
        className={`mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-[11px] uppercase tracking-[0.18em] ${
          centered ? "justify-center" : ""
        }`}
      >
        {steps.all.map((step, i) => {
          const on = current.has(step);
          return (
            <li key={step} className="flex items-center gap-2">
              {i > 0 && (
                <span aria-hidden style={{ color: "var(--text-faint)" }}>
                  →
                </span>
              )}
              <span
                data-step={on ? "current" : "other"}
                aria-current={on ? "step" : undefined}
                className={on ? "font-semibold" : "font-normal"}
                style={{ color: on ? "var(--accent)" : "var(--text-faint)" }}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </Reveal>
  );
}

/** Consistent eyebrow → headline → lede stack used by most layouts. */
export function SectionHeader({
  section,
  align = "left",
  size = "lg",
}: {
  section: Section;
  align?: "left" | "center";
  size?: "lg" | "xl";
}) {
  const centered = align === "center";
  return (
    // max-w-5xl: at 4xl the exercise headline broke inside its own hyphenated
    // compound — "Write your three-" / "line spec." — while the card grid
    // beneath it ran 600px wider. The measure was the constraint, not the copy.
    <div className={`max-w-5xl ${centered ? "mx-auto text-center" : ""}`}>
      {section.eyebrow && (
        <Reveal>
          <NeuBadge>{section.eyebrow}</NeuBadge>
        </Reveal>
      )}
      {section.steps && <StepStrip steps={section.steps} centered={centered} />}
      <Reveal delay={0.08}>
        <h2
          className={`mt-5 font-display font-semibold leading-[1.08] tracking-[-0.025em] text-balance ${
            size === "xl"
              ? "text-[clamp(2.2rem,4.8vw,3.9rem)]"
              : "text-[clamp(1.85rem,3.8vw,3rem)]"
          }`}
          style={{ color: "var(--text)" }}
        >
          <AccentTitle title={section.title} accent={section.accent} />
        </h2>
      </Reveal>
      {section.lede && (
        <Reveal delay={0.16}>
          <p
            className={`mt-5 max-w-2xl text-[clamp(0.98rem,1.2vw,1.08rem)] leading-relaxed ${
              centered ? "mx-auto" : ""
            }`}
            style={{ color: "var(--text-dim)" }}
          >
            {section.lede}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/**
 * Small print: source citations and stage notes from the deck.
 *
 * `href` lives here rather than in each layout. It was handled in exactly one
 * of them, so adding `footnoteHref` to a cards section produced grey text where
 * a link was meant to be — the reader is told the kit is at /kit and given
 * nothing to press. Every caller passes `section.footnoteHref`; a layout that
 * forgets loses the link, which is why they all read the same now.
 */
export function Footnote({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) {
  const className =
    "mt-10 max-w-4xl font-sans text-[13px] uppercase tracking-[0.14em]";

  if (!href) {
    return (
      <p className={className} style={{ color: "var(--text-faint)" }}>
        {children}
      </p>
    );
  }

  const external = !href.startsWith("/");
  return (
    <p className={className}>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer noopener" : undefined}
        data-deck-keys="off"
        className="underline-offset-4 hover:underline"
        style={{ color: "var(--accent)" }}
      >
        {children} <span aria-hidden>{external ? "↗" : "→"}</span>
      </a>
    </p>
  );
}

/**
 * The GO DEEPER strip: a claim worth chasing, and where to chase it.
 *
 * Follows `Footnote`'s conventions rather than `Strip`'s, and that distinction is
 * the whole design. `Strip` gets a carved `neu-inset` surface because it carries
 * content the headline just promised; this is a citation, so it gets a hairline
 * rule and the page ground. Giving it a panel too would end fourteen slides in
 * two competing bands.
 *
 * The claim is set in `--text`, not `--text-faint`. It is small and it is chrome
 * in the room, but it is content on the recording, and `tests/contrast.spec.ts`
 * is the record of what faint body copy does on a projector.
 */
export function Deeper({
  deeper,
  sectionId,
  align = "left",
}: {
  deeper: NonNullable<Section["deeper"]>;
  sectionId: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <Reveal delay={0.32}>
      <div
        data-deeper
        className={`mt-8 flex flex-col gap-2 border-t pt-5 md:flex-row md:items-baseline md:gap-5 ${
          centered ? "mx-auto max-w-3xl text-center md:justify-center" : "max-w-4xl"
        }`}
        style={{ borderColor: "var(--edge)" }}
      >
        <p
          className="shrink-0 font-sans text-[11px] font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--text-faint)" }}
        >
          {deeper.label ?? "Go deeper"} <span aria-hidden>→</span>
        </p>
        <p className="text-[0.9rem] leading-relaxed">
          <span className="font-medium" style={{ color: "var(--text)" }}>
            {deeper.claim}
          </span>
          {deeper.note && (
            <span style={{ color: "var(--text-dim)" }}> {deeper.note}</span>
          )}
          {deeper.links.map((link) => {
            const external = !link.href.startsWith("/");
            return (
              <span key={link.href}>
                {"  "}
                <a
                  href={link.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer noopener" : undefined}
                  data-deck-keys="off"
                  onClick={() =>
                    logEvent("link_clicked", sectionId, { label: link.label })
                  }
                  className="underline-offset-4 hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  {link.label} <span aria-hidden>{external ? "↗" : "→"}</span>
                </a>
              </span>
            );
          })}
        </p>
      </div>
    </Reveal>
  );
}

/**
 * The tail every layout ends with, in the one order the deck reads.
 *
 * This exists because "each of twelve layouts must remember four optional
 * fields" is a defect generator, not a convention: `strip`, `footnoteHref`,
 * `brand` and `media` have each been silently dropped by a layout that did not
 * know about them, and `tests/registry-integrity.spec.ts` exists because of it.
 * `deeper` would have been the fifth. One component means adding a sixth tier is
 * one edit rather than twelve.
 *
 * The layouts with a bespoke centered or column-scoped footnote — claim, cta,
 * poll, hero, chart — append `<Deeper>` alone instead of calling this.
 */
export function SectionTail({ section }: { section: Section }) {
  return (
    <>
      {section.strip && <Strip {...section.strip} />}
      {section.kicker && <Kicker>{section.kicker}</Kicker>}
      {section.footnote && (
        <Footnote href={section.footnoteHref}>{section.footnote}</Footnote>
      )}
      {section.deeper && <Deeper deeper={section.deeper} sectionId={section.id} />}
    </>
  );
}

/**
 * A labelled strip: the minimum standard, Jordan's rules, the minimum test
 * pack, what the tool must show on screen.
 *
 * These are content — on the slide they are a band under the cards, carrying
 * items that appear nowhere else. Routing them through `footnote` set nine
 * production criteria in the same 11px letterspaced grey used for a citation,
 * which made the least legible thing on the slide the thing the headline had
 * just promised. They get their own surface and body-sized type instead.
 */
export function Strip({ label, items }: { label?: string; items: string[] }) {
  return (
    <Reveal delay={0.26}>
      <div className="neu-inset neu-edge mt-10 rounded-2xl px-6 py-5 md:px-8 md:py-6">
        {label && (
          <p
            className="font-sans text-[11px] font-medium uppercase tracking-[0.2em]"
            style={{ color: "var(--accent)" }}
          >
            {label}
          </p>
        )}
        <p
          className={`${label ? "mt-3" : ""} text-[clamp(0.95rem,1.15vw,1.05rem)] leading-relaxed`}
          style={{ color: "var(--text)" }}
        >
          {items.map((item, i) => (
            <span key={item}>
              {i > 0 && (
                <span aria-hidden style={{ color: "var(--text-faint)" }}>
                  {"  ·  "}
                </span>
              )}
              {item}
            </span>
          ))}
        </p>
      </div>
    </Reveal>
  );
}

/** The load-bearing one-liner that closes a section. */
export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <Reveal delay={0.24}>
      <p
        className="mt-9 max-w-3xl border-l-2 pl-6 font-display text-[clamp(1rem,1.5vw,1.25rem)] font-medium leading-snug text-balance"
        style={{ borderColor: "var(--accent)", color: "var(--text)" }}
      >
        {children}
      </p>
    </Reveal>
  );
}

export const CONTAINER = "relative z-10 mx-auto w-full max-w-[1200px] px-6 md:px-12";
