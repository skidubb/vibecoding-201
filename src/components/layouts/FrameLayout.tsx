"use client";

import { Glow } from "@/components/core/ParallaxLayer";
import { Reveal } from "@/components/neu/Neu";
import {
  CONTAINER,
  FlatCard,
  SectionBackdrop,
  SectionHeader,
  SectionTail,
  type LayoutProps,
} from "./shared";

/**
 * Cards inside a labelled container. The frame is the argument: its corner
 * labels name the whole (the harness, ~90% of the working system) and the
 * cards inside are its parts, drawn as one row of equal panels — the model is
 * one component among five, and a card's `meta` (its share of the system)
 * renders as a faint figure beside the title rather than as an accent
 * treatment. Scott's 2026-08-05 punch list removed the featured model card:
 * the highlight said the opposite of the slide's own headline, and the
 * two-tier arrangement made the slide taller than a screen.
 */
export function FrameLayout({ section }: LayoutProps) {
  const cards = section.cards ?? [];

  return (
    <>
      <SectionBackdrop section={section} />
      <Glow className="right-[-18vw] top-[-10vh]" tone="magenta" size={52} />

      <div className={CONTAINER}>
        <SectionHeader section={section} />

        <Reveal delay={0.12}>
          <div
            className="mt-8 rounded-[28px] border p-4 md:p-6"
            style={{
              borderColor: "var(--edge)",
              background: "color-mix(in srgb, var(--surface) 45%, transparent)",
            }}
          >
            <div
              className="flex items-baseline justify-between gap-4 border-b pb-3"
              style={{ borderColor: "var(--edge)" }}
            >
              {section.frame?.label && (
                <p
                  className="font-sans text-[11px] font-medium uppercase tracking-[0.2em]"
                  style={{ color: "var(--accent)" }}
                >
                  {section.frame.label}
                </p>
              )}
              {section.frame?.note && (
                <p
                  className="text-right font-sans text-[11px] uppercase tracking-[0.2em]"
                  style={{ color: "var(--text-faint)" }}
                >
                  {section.frame.note}
                </p>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {cards.map((card, i) => (
                <Reveal key={card.title} delay={0.16 + i * 0.06}>
                  <FlatCard className="h-full p-4 md:p-5">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3
                        className="font-display text-[0.98rem] font-semibold tracking-tight"
                        style={{ color: "var(--text)" }}
                      >
                        {card.title}
                      </h3>
                      {card.meta && (
                        <span
                          className="font-sans text-[11px] uppercase tracking-[0.14em]"
                          style={{ color: "var(--text-faint)" }}
                        >
                          {card.meta}
                        </span>
                      )}
                    </div>
                    {card.body && (
                      <p
                        className="mt-1.5 text-[0.86rem] leading-relaxed"
                        style={{ color: "var(--text-dim)" }}
                      >
                        {card.body}
                      </p>
                    )}
                  </FlatCard>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>

        <SectionTail section={section} />
      </div>
    </>
  );
}
