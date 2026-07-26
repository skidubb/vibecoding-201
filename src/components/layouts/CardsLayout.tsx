"use client";

import { motion } from "motion/react";
import { Glow, ImageBackdrop } from "@/components/core/ParallaxLayer";
import { NeuPanel, Reveal } from "@/components/neu/Neu";
import { CONTAINER, Footnote, Kicker, SectionHeader, type LayoutProps } from "./shared";

/**
 * Numbered card grid — the workhorse for the deck's many enumerated lists
 * (outcomes, archetypes, killers). Column count follows card count so five
 * archetypes read as one row on desktop rather than a ragged 3+2.
 */
export function CardsLayout({ section }: LayoutProps) {
  const count = section.cards?.length ?? 0;
  const cols =
    count === 3
      ? "md:grid-cols-3"
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

        {section.kicker && count > 0 && section.theme === "light" && (
          <Reveal delay={0.2}>
            <p
              className="mt-9 font-sans text-[11px] font-medium uppercase tracking-[0.22em]"
              style={{ color: "var(--accent)" }}
            >
              {section.kicker}
            </p>
          </Reveal>
        )}

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
                  <span
                    className="font-display text-2xl font-semibold tabular-nums"
                    style={{ color: "var(--accent)", opacity: 0.85 }}
                  >
                    {card.label}
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
                </NeuPanel>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {section.kicker && section.theme === "dark" && <Kicker>{section.kicker}</Kicker>}
        {section.footnote && <Footnote>{section.footnote}</Footnote>}
      </div>
    </>
  );
}
