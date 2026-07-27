"use client";

import { motion } from "motion/react";
import { Glow } from "@/components/core/ParallaxLayer";
import { AccentTitle, NeuBadge } from "@/components/neu/Neu";
import { CONTAINER, Strip, type LayoutProps } from "./shared";

/**
 * A pure typographic beat. No panel, no image — the page goes quiet so one
 * sentence can carry the whole argument. Words rise in sequence rather than
 * the block fading in, which reads as someone saying it out loud.
 */
export function ClaimLayout({ section }: LayoutProps) {
  const words = section.title.split(" ");
  const accentWords = section.accent?.split(" ") ?? [];

  return (
    <>
      <Glow className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" size={70} />

      <div className={`${CONTAINER} mx-auto max-w-5xl text-center`}>
        {section.eyebrow && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <NeuBadge>{section.eyebrow}</NeuBadge>
          </motion.div>
        )}

        <h2
          className="mt-8 font-display text-[clamp(1.9rem,4.1vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.03em]"
          style={{ color: "var(--text)" }}
        >
          {words.map((word, i) => {
            const isAccent = accentWords.includes(word);
            return (
              <motion.span
                key={`${word}-${i}`}
                initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: 0.16 + i * 0.045,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inline-block"
                style={{
                  color: isAccent ? "var(--accent)" : undefined,
                  marginRight: "0.26em",
                }}
              >
                {word}
              </motion.span>
            );
          })}
        </h2>

        {section.kicker && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.3 + words.length * 0.03,
              ease: [0.16, 1, 0.3, 1],
            }}
            // max-w-3xl, not max-w-xl: at xl the governing claim's punchline
            // wrapped so "Judgment is." sat alone on a centred second line.
            className="mx-auto mt-12 max-w-3xl font-display text-[clamp(1.05rem,1.7vw,1.35rem)] font-medium leading-snug text-balance"
            style={{ color: "var(--text-dim)" }}
          >
            <AccentTitle title={section.kicker} accent="Judgment is." />
          </motion.p>
        )}

        {/* Prose that is the slide's argument rather than an aside — the
            idempotency explanation, for one. Footnote type is for citations,
            and putting the payload there set it five times smaller than the
            headline it explains. */}
        {section.lede && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.42 }}
            className="mx-auto mt-8 max-w-2xl text-[clamp(0.98rem,1.2vw,1.08rem)] leading-relaxed"
            style={{ color: "var(--text-dim)" }}
          >
            {section.lede}
          </motion.p>
        )}

        {section.strip && (
          <div className="mx-auto max-w-3xl text-left">
            <Strip {...section.strip} />
          </div>
        )}

        {section.footnote && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mx-auto mt-10 max-w-2xl font-sans text-[14px] font-medium uppercase tracking-[0.12em]"
            style={{ color: "var(--text-faint)" }}
          >
            {/* A linked footnote is an instruction — go here, open this — so it
                takes the accent and reads as a destination. "Cast a vote at
                /vote" set in the dimmest grey on the slide was the one line
                the room was supposed to act on. */}
            {section.footnoteHref ? (
              <a
                href={section.footnoteHref}
                target={section.footnoteHref.startsWith("/") ? undefined : "_blank"}
                rel={section.footnoteHref.startsWith("/") ? undefined : "noreferrer noopener"}
                data-deck-keys="off"
                className="underline underline-offset-4 decoration-1"
                style={{ color: "var(--accent)" }}
              >
                {section.footnote} <span aria-hidden>↗</span>
              </a>
            ) : (
              section.footnote
            )}
          </motion.p>
        )}
      </div>
    </>
  );
}
