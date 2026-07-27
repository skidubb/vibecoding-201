"use client";

import type { Section } from "@/content/sections";
import { AccentTitle, NeuBadge, Reveal } from "@/components/neu/Neu";

export type LayoutProps = { section: Section; index: number };

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
