"use client";

import { motion } from "motion/react";
import { Glow, ImageBackdrop } from "@/components/core/ParallaxLayer";
import { NeuBadge, NeuButton } from "@/components/neu/Neu";
import { useDeck } from "@/lib/deck-context";
import { CONTAINER, type LayoutProps } from "./shared";

/** The three-line close, delivered one line at a time. */
export function CtaLayout({ section }: LayoutProps) {
  const { goToIndex } = useDeck();
  const lines = section.title.split(". ").filter(Boolean);

  return (
    <>
      {section.media?.image && (
        <ImageBackdrop
          src={section.media.image}
          speed={section.media.speed}
          opacity={0.3}
        />
      )}
      <Glow className="left-1/2 top-1/3 -translate-x-1/2" tone="magenta" size={64} />

      <div className={`${CONTAINER} mx-auto max-w-3xl text-center`}>
        {section.eyebrow && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <NeuBadge accent>{section.eyebrow}</NeuBadge>
          </motion.div>
        )}

        <div className="mt-10 flex flex-col gap-1">
          {lines.map((line, i) => {
            const isLast = i === lines.length - 1;
            const text = line.endsWith(".") ? line : `${line}.`;
            return (
              <motion.p
                key={text}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: 0.14 + i * 0.16,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="font-display text-[clamp(2rem,5vw,3.8rem)] font-semibold leading-[1.1] tracking-[-0.03em]"
                style={{ color: isLast ? "var(--accent)" : "var(--text)" }}
              >
                {text}
              </motion.p>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto mt-10 max-w-xl text-[1.05rem] leading-relaxed"
          style={{ color: "var(--text-dim)" }}
        >
          {section.lede}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.74 }}
          className="mt-12 flex flex-col items-center gap-8"
        >
          <NeuButton onClick={() => goToIndex(0)}>Back to the top</NeuButton>
          {/* Body colour, not faint: this is the presenter's own name on the
              last slide the room looks at, and it sits over a photograph
              whose local luminance varies. */}
          <span
            className="font-sans text-[13px] uppercase tracking-[0.2em]"
            style={{ color: "var(--text)" }}
          >
            {section.kicker}
          </span>

          {/* The last slide is where the room is told where to take the kit
              from, so this layout can no longer be the one that ignores a
              footnote. Centred, unlike the shared Footnote, because everything
              else on this slide is. */}
          {section.footnote && (
            <a
              href={section.footnoteHref ?? "#"}
              data-deck-keys="off"
              className="font-sans text-[12px] uppercase tracking-[0.16em] underline-offset-4 hover:underline"
              style={{ color: "var(--accent)" }}
            >
              {section.footnote} <span aria-hidden>→</span>
            </a>
          )}
        </motion.div>
      </div>
    </>
  );
}
