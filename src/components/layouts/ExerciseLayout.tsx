"use client";

import { Glow } from "@/components/core/ParallaxLayer";
import { NeuPanel, Reveal } from "@/components/neu/Neu";
import { CONTAINER, Footnote, Kicker, SectionHeader, Strip, type LayoutProps } from "./shared";
import { ExerciseWidget } from "@/components/interactive/ExerciseWidget";

/**
 * A hands-on section: the brief, a clock, and somewhere to write.
 *
 * The cards are the brief and stay compact — on this slide they are the three
 * lines being asked for, not the content of the slide, and the room's attention
 * belongs on the timer and the box. Never tall: like the poll, the widget
 * reserves room for its own status line so the section's height does not move
 * under a presenter mid-exercise.
 */
export function ExerciseLayout({ section }: LayoutProps) {
  const exercise = section.exercise;

  return (
    <>
      <Glow className="right-[-16vw] top-[-8vh]" tone="magenta" size={48} />

      <div className={CONTAINER}>
        <SectionHeader section={section} />

        {section.cards && section.cards.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {section.cards.map((card, i) => (
              <Reveal key={card.title} delay={0.08 + i * 0.07}>
                <NeuPanel radius="rounded-[24px]" className="flex h-full flex-col p-5 md:p-6">
                  <span
                    className="font-display text-xl font-semibold tabular-nums"
                    style={{ color: "var(--accent)", opacity: 0.85 }}
                  >
                    {card.label}
                  </span>
                  <h3
                    className="mt-3 font-display text-[1.02rem] font-semibold leading-snug tracking-tight"
                    style={{ color: "var(--text)" }}
                  >
                    {card.title}
                  </h3>
                  {card.body && (
                    <p
                      className="mt-2 text-[0.9rem] leading-relaxed"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {card.body}
                    </p>
                  )}
                  {card.meta && (
                    <p
                      className="mt-3 font-sans text-[12px] uppercase tracking-[0.16em]"
                      style={{ color: "var(--text-faint)" }}
                    >
                      {card.meta}
                    </p>
                  )}
                </NeuPanel>
              </Reveal>
            ))}
          </div>
        )}

        {exercise && <ExerciseWidget exercise={exercise} sectionId={section.id} />}

        {section.strip && <Strip {...section.strip} />}
        {section.kicker && <Kicker>{section.kicker}</Kicker>}
        {section.footnote && <Footnote href={section.footnoteHref}>{section.footnote}</Footnote>}
      </div>
    </>
  );
}
