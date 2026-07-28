"use client";

import { motion } from "motion/react";
import { Glow, VideoBackdrop } from "@/components/core/ParallaxLayer";
import { NeuPanel, Reveal } from "@/components/neu/Neu";
import { CONTAINER, Kicker, SectionHeader, type LayoutProps } from "./shared";

/**
 * Spec → Plan → Build → Test → Ship → Run, as a ring rather than a row: the
 * point of the section is that it comes back around.
 */
export function LoopLayout({ section }: LayoutProps) {
  const steps = section.loopSteps ?? [];

  return (
    <>
      {section.media?.video && (
        <VideoBackdrop
          src={section.media.video}
          poster={section.media.poster}
          speed={section.media.speed}
          opacity={0.22}
        />
      )}
      <Glow className="right-[-12vw] top-[10vh]" tone="magenta" size={48} />

      <div className={CONTAINER}>
        <SectionHeader section={section} align="center" />

      <div className="mt-12 flex flex-wrap items-stretch justify-center gap-3 md:gap-4">
        {steps.map((step, i) => (
          <Reveal key={step} delay={0.06 * i}>
            <div className="flex items-center gap-3 md:gap-4">
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
              >
                <NeuPanel
                  className="flex min-w-[130px] flex-col items-center px-7 py-6"
                  radius="rounded-[20px]"
                >
                  <span
                    className="font-display text-lg font-semibold tracking-tight"
                    style={{ color: "var(--text)" }}
                  >
                    {step}
                  </span>
                </NeuPanel>
              </motion.div>

              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="hidden text-lg md:inline"
                  style={{ color: "var(--text-faint)" }}
                >
                  →
                </span>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      {/* The return: the arrow that makes it a loop rather than a pipeline. */}
      <Reveal delay={0.45}>
        <div className="mt-8 flex items-center justify-center gap-3">
          <span
            className="h-[1px] w-16 md:w-40"
            style={{
              background: "linear-gradient(90deg, transparent, var(--accent))",
            }}
          />
          {/* No ↻ glyph. Neither display face carries it, so it fell back to
              a font that drew it at half cap height and below the baseline —
              a stray mark, on the one slide about the loop coming back
              around. The rules either side already say "return". */}
          <span
            className="font-sans text-[11px] uppercase tracking-[0.24em]"
            style={{ color: "var(--accent)" }}
          >
            and back to spec
          </span>
          <span
            className="h-[1px] w-16 md:w-40"
            style={{
              background: "linear-gradient(90deg, var(--accent), transparent)",
            }}
          />
        </div>
      </Reveal>

        {section.kicker && <Kicker>{section.kicker}</Kicker>}
      </div>
    </>
  );
}
