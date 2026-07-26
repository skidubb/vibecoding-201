"use client";

import { motion } from "motion/react";
import { Glow } from "@/components/core/ParallaxLayer";
import { AccentTitle, NeuBadge } from "@/components/neu/Neu";
import { CONTAINER, type LayoutProps } from "./shared";

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
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <NeuBadge>{section.eyebrow}</NeuBadge>
        </motion.div>

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
                viewport={{ once: true, margin: "-15%" }}
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
            viewport={{ once: true, margin: "-10%" }}
            transition={{
              duration: 0.8,
              delay: 0.3 + words.length * 0.03,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mx-auto mt-12 max-w-xl font-display text-[clamp(1.05rem,1.7vw,1.35rem)] font-medium leading-snug"
            style={{ color: "var(--text-dim)" }}
          >
            <AccentTitle title={section.kicker} accent="Judgment is." />
          </motion.p>
        )}
      </div>
    </>
  );
}
