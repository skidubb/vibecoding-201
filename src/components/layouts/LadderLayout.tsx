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
 * A staircase of flat cards climbing up and to the right — reach rising, and
 * the verification floor rising with it. Cards come in registry order from the
 * bottom step up; the last one is the top step and carries `tone: "bad"`
 * styling's accent border via the registry when the deck wants it marked.
 *
 * The climb is drawn with per-step indentation rather than absolute
 * positioning, so the section keeps normal flow height and the presenter stop
 * grid stays stable.
 */
export function LadderLayout({ section }: LayoutProps) {
  const cards = section.cards ?? [];
  const steps = [...cards].reverse(); // render top step first, DOM order top→bottom

  return (
    <>
      <SectionBackdrop section={section} />
      <Glow className="right-[-18vw] top-[-10vh]" tone="magenta" size={52} />

      <div className={CONTAINER}>
        <SectionHeader section={section} />

        <div className="relative mt-10">
          <div className="flex flex-col gap-3">
            {steps.map((card, i) => {
              // i = 0 is the top step; indent grows toward the bottom's zero.
              const fromBottom = steps.length - 1 - i;
              return (
                <Reveal key={card.title} delay={0.1 + fromBottom * 0.09}>
                  <div
                    className="max-w-[560px]"
                    style={{ marginLeft: `min(${fromBottom * 12}%, ${fromBottom * 150}px)` }}
                  >
                    <FlatCard tone={card.tone} className="p-5">
                      <h3
                        className="font-display text-[1rem] font-semibold tracking-tight"
                        style={{
                          color: card.tone === "bad" ? "var(--accent)" : "var(--text)",
                        }}
                      >
                        {card.title}
                      </h3>
                      {card.body && (
                        <p
                          className="mt-1.5 text-[0.9rem] leading-relaxed"
                          style={{ color: "var(--text-dim)" }}
                        >
                          {card.body}
                        </p>
                      )}
                    </FlatCard>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* The rigor scale under the climb: what the low end and the high
              end of the practice are called. The gradient runs dim to accent
              in the same direction the steps climb. */}
          {section.spectrum && (
            <Reveal delay={0.5}>
              <div className="mt-10 max-w-[1010px]">
                <div className="flex items-baseline justify-between font-sans text-[11px] font-medium uppercase tracking-[0.2em]">
                  <span style={{ color: "var(--text-dim)" }}>
                    {section.spectrum.left}
                  </span>
                  <span style={{ color: "var(--accent)" }}>
                    {section.spectrum.right}
                  </span>
                </div>
                <div
                  aria-hidden
                  className="mt-2 h-[3px] rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, color-mix(in srgb, var(--text-faint) 55%, transparent), var(--accent))",
                  }}
                />
              </div>
            </Reveal>
          )}
        </div>

        <SectionTail section={section} />
      </div>
    </>
  );
}
