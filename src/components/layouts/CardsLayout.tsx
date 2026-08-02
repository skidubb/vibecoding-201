"use client";

import { motion } from "motion/react";
import { Glow } from "@/components/core/ParallaxLayer";
import { NeuPanel, Reveal } from "@/components/neu/Neu";
import { CONTAINER, SectionBackdrop, SectionHeader, SectionTail, type LayoutProps } from "./shared";
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
  const hasBrands = section.cards?.some((card) => card.brand) ?? false;
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
      {/* Backdrop and glows are siblings of the container so they go full-bleed.

          Routed through `SectionBackdrop` rather than calling `ImageBackdrop`
          directly, because the direct call handled `media.image` only. Giving a
          cards section `media.video` put the file in the bundle and nothing on the
          screen, which is the same defect already recorded for `strip`,
          `footnoteHref`, `brand` and `media`. */}
      <SectionBackdrop section={section} />
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
                  {/* The mark row renders for every card in a section where
                      any card names a product — min-height included — so a
                      row where only some carry a brand still lines its
                      headlines up. A layout that ignored `brand` would delete
                      it from the deck with nothing failing anywhere — which
                      is how Jordan's authorization rules once vanished. */}
                  {hasBrands && (
                    <span className="flex min-h-[22px] items-center justify-end">
                      {card.brand && <Logo brand={card.brand} height={22} />}
                    </span>
                  )}
                  <h3
                    className={`${hasBrands ? "mt-4 " : ""}font-display text-[1.06rem] font-semibold leading-snug tracking-tight`}
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
                      {card.met === false ? "Not yet: see why" : "Evidence"}
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

        <SectionTail section={section} />
      </div>
    </>
  );
}
