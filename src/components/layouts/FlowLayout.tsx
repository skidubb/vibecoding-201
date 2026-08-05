"use client";

import { Glow } from "@/components/core/ParallaxLayer";
import { Reveal } from "@/components/neu/Neu";
import {
  CONTAINER,
  Deeper,
  Footnote,
  Kicker,
  SectionBackdrop,
  SectionHeader,
  type LayoutProps,
} from "./shared";

/** Icon keyed by column position: upload, screen, code, network, terminal. */
function FlowIcon({ index }: { index: number }) {
  const marks = [
    // upload
    <g key="0">
      <path d="M12 16V4" />
      <path d="m6 9 6-5 6 5" />
      <path d="M4 20h16" />
    </g>,
    // screen
    <g key="1">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </g>,
    // code
    <g key="2">
      <path d="m8 8-4 4 4 4" />
      <path d="m16 8 4 4-4 4" />
      <path d="m13 5-2 14" />
    </g>,
    // network
    <g key="3">
      <circle cx="12" cy="5" r="2.4" />
      <circle cx="5" cy="19" r="2.4" />
      <circle cx="19" cy="19" r="2.4" />
      <path d="M12 7.4 5.8 16.8M12 7.4l6.2 9.4M7.4 19h9.2" />
    </g>,
    // terminal
    <g key="4">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3 3-3 3" />
      <path d="M13 15h4" />
    </g>,
  ];
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {marks[index % marks.length]}
    </svg>
  );
}

/**
 * A horizontal pipeline: one icon node per card on a connecting line, name and
 * body beneath, and the card's `meta` as the accent caution line. The strip
 * renders as a chip row rather than the inset band — these are the axes a
 * choice is made on, not a list being read.
 */
export function FlowLayout({ section }: LayoutProps) {
  const cards = section.cards ?? [];

  return (
    <>
      <SectionBackdrop section={section} />
      <Glow className="right-[-18vw] top-[-10vh]" tone="magenta" size={52} />

      <div className={CONTAINER}>
        <SectionHeader section={section} />

        <div className="relative mt-12">
          {/* The connecting line, behind the icon nodes. */}
          <div
            aria-hidden
            className="absolute left-[10%] right-[10%] top-[28px] hidden h-px md:block"
            style={{ background: "color-mix(in srgb, var(--accent) 35%, transparent)" }}
          />
          <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-5 md:gap-5">
            {cards.map((card, i) => (
              <Reveal key={card.title} delay={0.08 + i * 0.08}>
                <div className="relative">
                  <span
                    className="relative inline-flex h-14 w-14 items-center justify-center rounded-full border"
                    style={{
                      borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)",
                      background: "var(--surface)",
                    }}
                  >
                    <FlowIcon index={i} />
                  </span>
                  <h3
                    className="mt-4 font-display text-[1.02rem] font-semibold tracking-tight"
                    style={{ color: "var(--text)" }}
                  >
                    {card.title}
                  </h3>
                  {card.body && (
                    <p
                      className="mt-2 text-[0.88rem] leading-relaxed"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {card.body}
                    </p>
                  )}
                  {card.meta && (
                    <p
                      className="mt-3 font-sans text-[10.5px] font-medium uppercase leading-relaxed tracking-[0.14em]"
                      style={{ color: "var(--accent)" }}
                    >
                      {card.meta}
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* The choose-by chips. Rendered here instead of through SectionTail's
            inset band: axes to weigh, not content to read back. */}
        {section.strip && (
          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              {section.strip.label && (
                <p
                  className="font-sans text-[11px] font-medium uppercase tracking-[0.2em]"
                  style={{ color: "var(--text-faint)" }}
                >
                  {section.strip.label}
                </p>
              )}
              {section.strip.items.map((item) => (
                <span
                  key={item}
                  className="rounded-full border px-4 py-1.5 text-[0.85rem]"
                  style={{ borderColor: "var(--edge)", color: "var(--text)" }}
                >
                  {item}
                </span>
              ))}
            </div>
          </Reveal>
        )}

        {section.kicker && <Kicker>{section.kicker}</Kicker>}
        {section.footnote && (
          <Footnote href={section.footnoteHref}>{section.footnote}</Footnote>
        )}
        {section.deeper && <Deeper deeper={section.deeper} sectionId={section.id} />}
      </div>
    </>
  );
}
