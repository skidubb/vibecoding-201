"use client";

import { motion } from "motion/react";
import { Glow } from "@/components/core/ParallaxLayer";
import { NeuPanel, Reveal } from "@/components/neu/Neu";
import { CONTAINER, SectionBackdrop, SectionHeader, SectionTail, type LayoutProps } from "./shared";

/**
 * Spec → Plan → Build → Test → Ship → Run as one pathway with a return band:
 * the section's argument is that Run feeds the next Spec. Each stage panel
 * prints two rows, what the stage produces and what lets the work advance out
 * of it, both tagged so tests/registry-integrity.spec.ts can count them — the
 * six stage names are shorter than the content check's floor.
 */
export function LoopLayout({ section }: LayoutProps) {
  const stages = section.loopStages ?? [];

  return (
    <>
      <SectionBackdrop section={section} />
      <Glow className="right-[-12vw] top-[10vh]" tone="magenta" size={48} />

      <div className={CONTAINER}>
        <SectionHeader section={section} />

        <ol className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {stages.map((stage, i) => (
            <li key={stage.name} data-loop-stage>
              <Reveal delay={0.06 * i}>
                <motion.div
                  className="h-full"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                >
                  <NeuPanel radius="rounded-[20px]" className="flex h-full flex-col p-5">
                    <div className="flex min-h-[22px] items-center gap-3">
                      <span
                        className="font-display text-lg font-semibold tracking-tight"
                        style={{ color: "var(--text)" }}
                      >
                        {stage.name}
                      </span>
                      {/* The connector. Drawn per node rather than between
                          them, because the grid wraps at two breakpoints and a
                          line spanning the gaps would hang off the end of each
                          row. */}
                      <span
                        aria-hidden
                        className="h-px flex-1"
                        style={{ background: "var(--text-faint)", opacity: 0.3 }}
                      />
                    </div>

                    <div className="mt-3" data-produces>
                      <span
                        className="block font-sans text-[10px] uppercase tracking-[0.2em]"
                        style={{ color: "var(--accent)" }}
                      >
                        Produces
                      </span>
                      <span
                        className="mt-1 block text-[0.88rem] leading-snug"
                        style={{ color: "var(--text)" }}
                      >
                        {stage.produces}
                      </span>
                    </div>

                    <div className="mt-3" data-advances>
                      <span
                        className="block font-sans text-[10px] uppercase tracking-[0.2em]"
                        style={{ color: "var(--accent)" }}
                      >
                        Advances when
                      </span>
                      <span
                        className="mt-1 block text-[0.88rem] leading-snug"
                        style={{ color: "var(--text-dim)" }}
                      >
                        {stage.advances}
                      </span>
                    </div>
                  </NeuPanel>
                </motion.div>
              </Reveal>
            </li>
          ))}
        </ol>

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
                around. The band's own words carry the return. */}
            <span
              className="font-sans text-[11px] uppercase tracking-[0.24em]"
              style={{ color: "var(--accent)" }}
            >
              evidence from use · back to spec
            </span>
            <span
              className="h-[1px] w-16 md:w-40"
              style={{
                background: "linear-gradient(90deg, var(--accent), transparent)",
              }}
            />
          </div>
        </Reveal>

        <SectionTail section={section} />
      </div>
    </>
  );
}
