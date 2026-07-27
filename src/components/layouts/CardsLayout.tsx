"use client";

import { motion } from "motion/react";
import { Glow, ImageBackdrop } from "@/components/core/ParallaxLayer";
import { NeuPanel, Reveal } from "@/components/neu/Neu";
import { CONTAINER, Footnote, Kicker, SectionHeader, Strip, type LayoutProps } from "./shared";
import { EventFeed } from "@/components/interactive/EventFeed";
import { Logo } from "@/components/layouts/Logo";
import { PromptBlock } from "@/components/interactive/PromptBlock";

/**
 * Numbered card grid — the workhorse for the deck's many enumerated lists
 * (defects, doors, questions). Column count follows card count so five doors
 * read as one row on desktop rather than a ragged 3+2, and four questions sit
 * two-by-two rather than 3+1.
 */
export function CardsLayout({ section }: LayoutProps) {
  const count = section.cards?.length ?? 0;
  const cols =
    count === 2
      ? "md:grid-cols-2"
      : count === 3
        ? "md:grid-cols-3"
        : count === 4
          ? "md:grid-cols-2"
          : count === 5
            ? "md:grid-cols-3 lg:grid-cols-5"
            : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <>
      {/* Backdrop and glows are siblings of the container so they go full-bleed. */}
      {section.media?.image && (
        <ImageBackdrop
          src={section.media.image}
          speed={section.media.speed}
          opacity={section.theme === "dark" ? 0.3 : 0.24}
          scrim={section.theme}
        />
      )}
      <Glow className="right-[-18vw] top-[-10vh]" tone="magenta" size={52} />

      <div className={CONTAINER}>
        <SectionHeader section={section} />

        <div className={`mt-8 grid gap-5 ${cols}`}>
          {section.cards?.map((card, i) => (
            <Reveal key={card.title} delay={0.08 + i * 0.07}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="h-full"
              >
                <NeuPanel
                  className="flex h-full flex-col p-6 md:p-7"
                  radius="rounded-[24px]"
                >
                  {/* The mark sits with the number, not above the title, so a
                      row of cards where only some name a product still lines
                      its headlines up. A layout that ignored `brand` would
                      delete it from the deck with nothing failing anywhere —
                      which is how Jordan's authorization rules once vanished. */}
                  <span className="flex items-center justify-between gap-3">
                    <span
                      className="font-display text-2xl font-semibold tabular-nums"
                      style={{ color: "var(--accent)", opacity: 0.85 }}
                    >
                      {card.label}
                    </span>
                    {card.brand && <Logo brand={card.brand} height={22} />}
                  </span>
                  <h3
                    className="mt-4 font-display text-[1.06rem] font-semibold leading-snug tracking-tight"
                    style={{ color: "var(--text)" }}
                  >
                    {card.title}
                  </h3>
                  {card.body && (
                    <p
                      className="mt-3 text-[0.94rem] leading-relaxed"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {card.body}
                    </p>
                  )}
                  {/* 12px, not 10px: this line is the step that repairs each
                      defect and the vocabulary of each layer — the answer to
                      several of these slides' headlines, not a caption. */}
                  {card.meta && (
                    <p
                      className="mt-3 font-sans text-[12px] uppercase tracking-[0.16em]"
                      style={{ color: "var(--text-faint)" }}
                    >
                      {card.meta}
                    </p>
                  )}

                  {/* Evidence, where a card makes a claim about this repository.
                      Pushed to the bottom so cards in a row line up whether or
                      not they carry one. */}
                  {card.href && (
                    <a
                      href={card.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      data-deck-keys="off"
                      className="mt-auto inline-flex items-baseline gap-2 pt-5 font-sans text-[11px] uppercase tracking-[0.14em] underline-offset-4 hover:underline"
                      style={{ color: card.met === false ? "var(--text-faint)" : "var(--accent)" }}
                    >
                      {card.met === false ? "Not yet — see why" : "Evidence"}
                      <span aria-hidden>↗</span>
                    </a>
                  )}
                </NeuPanel>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* A prompt quoted on a card slide — the delegation prompt under the
            three layers. Same copyable block the prompt layout uses. */}
        {section.prompts && section.prompts.length > 0 && (
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {section.prompts.map((prompt, i) => (
              <Reveal key={prompt.id} delay={0.1 + i * 0.08}>
                <PromptBlock
                  label={prompt.label}
                  text={prompt.text}
                  caption={prompt.caption}
                />
              </Reveal>
            ))}
          </div>
        )}

        {/* The Run section argues that a tool needs a log. Rather than say so
            and move on, it shows this page's own. */}
        {section.id === "run" && <EventFeed />}

        {section.strip && <Strip {...section.strip} />}
        {section.kicker && <Kicker>{section.kicker}</Kicker>}
        {section.footnote && <Footnote href={section.footnoteHref}>{section.footnote}</Footnote>}
      </div>
    </>
  );
}
