"use client";

import { Glow } from "@/components/core/ParallaxLayer";
import { NeuPanel, Reveal } from "@/components/neu/Neu";
import { CONTAINER, SectionBackdrop, SectionHeader, SectionTail, type LayoutProps } from "./shared";
import { ExerciseWidget } from "@/components/interactive/ExerciseWidget";
import { AnswerWidget } from "@/components/interactive/AnswerWidget";
import { JobPrompt } from "@/components/interactive/JobPrompt";
import { PromptBlock } from "@/components/interactive/PromptBlock";

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
      <SectionBackdrop section={section} />
      <Glow className="right-[-16vw] top-[-8vh]" tone="magenta" size={48} />

      <div className={CONTAINER}>
        <SectionHeader section={section} />

        {/* A checklist exercise renders these itself, as the rows you tick. Left
            in, the nine checks printed twice on one slide: once as cards with
            their evidence links and again as a bare list underneath, which also
            pushed the timer and the boxes below nine tall cards on a slide whose
            eyebrow says HANDS ON. */}
        {section.exercise?.mode !== "checklist" && section.cards && section.cards.length > 0 && (
          <div
            className={`mt-8 grid gap-4 ${
              // Four items read as a 2x2 block. At three columns the fourth card
              // sits alone on a second row.
              section.cards.length === 4 ? "md:grid-cols-2" : "md:grid-cols-3"
            }`}
          >
            {section.cards.map((card, i) => (
              <Reveal key={card.title} delay={0.08 + i * 0.07}>
                <NeuPanel radius="rounded-[24px]" className="flex h-full flex-col p-5 md:p-6">
                  <h3
                    className="font-display text-[1.02rem] font-semibold leading-snug tracking-tight"
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
                  {/* Evidence links, on the slide that asks the room to score this
                      site against nine items. Each link points at the file that
                      demonstrates the item; `met: false` marks the one item this
                      site does not pass. */}
                  {card.href && (
                    <a
                      href={card.href}
                      target={card.href.startsWith("/") ? undefined : "_blank"}
                      rel={card.href.startsWith("/") ? undefined : "noreferrer noopener"}
                      data-deck-keys="off"
                      className="mt-auto pt-4 font-sans text-[11px] uppercase tracking-[0.16em] underline-offset-4 hover:underline"
                      style={{
                        color: card.met === false ? "var(--text-faint)" : "var(--accent)",
                      }}
                    >
                      {card.met === false ? "Not yet: see why" : "Evidence"}{" "}
                      <span aria-hidden>↗</span>
                    </a>
                  )}
                </NeuPanel>
              </Reveal>
            ))}
          </div>
        )}

        {/* Above the box, because it is what fills the box: the prompt for the
            job this reader picked, carrying the Done they wrote. */}
        {section.jobPrompt && <JobPrompt />}

        {/* The prompt a build block asks the room to paste into their own agent.
            Rendered here rather than on a preceding `prompt` section because two
            hundred people pasting need it on the slide they are working from, and
            a layout that accepted `prompts` and dropped them is the defect
            tests/registry-integrity.spec.ts exists to catch. */}
        {section.prompts && section.prompts.length > 0 && (
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {section.prompts.map((prompt, i) => (
              <Reveal key={prompt.id} delay={0.1 + i * 0.08}>
                <PromptBlock label={prompt.label} text={prompt.text} caption={prompt.caption} />
              </Reveal>
            ))}
          </div>
        )}

        {/* Two widgets, chosen by mode. `count` and `checklist` return something
            to the person and an aggregate to the room, which is a different
            shape from the write/submit/share sequence the spec block needs, so
            they are a separate component rather than a branch inside that one.
            The checklist scores the cards above rather than a list of its own,
            which is why they are handed over here. */}
        {exercise &&
          (exercise.mode === "count" || exercise.mode === "checklist" ? (
            <AnswerWidget exercise={exercise} cards={section.cards ?? []} />
          ) : (
            <ExerciseWidget exercise={exercise} sectionId={section.id} />
          ))}

        <SectionTail section={section} />
      </div>
    </>
  );
}
