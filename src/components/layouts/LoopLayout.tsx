"use client";

import { motion, useReducedMotion } from "motion/react";
import { Glow } from "@/components/core/ParallaxLayer";
import { Reveal } from "@/components/neu/Neu";
import { CONTAINER, SectionBackdrop, SectionHeader, SectionTail, type LayoutProps } from "./shared";

/**
 * Spec → Plan → Build → Test → Ship → Run as one drawn circuit: a track
 * through six stages and a return path from Run back to Spec labeled
 * "evidence from use". One pathway, not a grid of cards — the slide's
 * argument is the return.
 *
 * The content is a single DOM for both breakpoints: the node-count test in
 * tests/registry-integrity.spec.ts uses locator.count(), which counts hidden
 * elements, so a desktop tree plus a mobile tree would double every count
 * (the matrix layout documents the same constraint). Only the two aria-hidden
 * decoration layers are breakpoint-duplicated. Every registry string is HTML
 * text, never SVG text — innerText, which the content check reads, does not
 * report SVG text.
 *
 * The decorative SVG is pinned by its edges: top at the track's y, bottom at
 * the return band's center, with preserveAspectRatio="none" and non-scaling
 * strokes. Every load-bearing line is horizontal or vertical at 0%/100% of
 * the box, so text wrapping cannot move the geometry off the nodes; only the
 * small corner arcs distort, imperceptibly at these radii.
 */
const EASE = [0.16, 1, 0.3, 1] as const;

export function LoopLayout({ section }: LayoutProps) {
  const stages = section.loopStages ?? [];
  const reduceMotion = useReducedMotion();

  const draw = (delay: number, duration: number) =>
    reduceMotion ? { duration: 0 } : { duration, delay, ease: EASE };

  return (
    <>
      <SectionBackdrop section={section} />
      <Glow className="right-[-12vw] top-[10vh]" tone="magenta" size={48} />

      <div className={CONTAINER}>
        <SectionHeader section={section} />

        <div className="relative mt-8" data-loop-pathway>
          {/* Desktop circuit. Track on the node-center line (y=0 of the box,
              15px into the wrapper); return down the right channel, along the
              bottom run with a centered gap for the label, up the left
              channel, closing at the track's start. */}
          {/* The svg lives inside a pinned div rather than being pinned
              itself: an absolutely positioned svg with top and bottom set
              keeps its viewBox aspect-ratio height and ignores bottom, so
              the circuit's bottom run drifts off the label band as the
              columns grow taller. A div stretches; the svg fills it. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[15px] bottom-[20px] hidden lg:block"
          >
          <svg
            className="h-full w-full"
            viewBox="0 0 1100 240"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M 10 0 H 1090"
              fill="none"
              stroke="var(--chart-line)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: reduceMotion ? 1 : 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={draw(0.15, 0.9)}
            />
            <motion.path
              d="M 1090 0 Q 1098 0 1098 16 V 224 Q 1098 240 1082 240 H 715 M 385 240 H 18 Q 2 240 2 224 V 16 Q 2 0 10 0"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: reduceMotion ? 1 : 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={draw(1.0, 0.9)}
            />
          </svg>
          </div>

          {/* Mobile circuit: a spine through the node dots and an accent
              return riser up the far-left gutter. Plain positioned rules —
              nothing here scales, so no SVG is needed. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 lg:hidden">
            <span
              className="absolute left-[20px] top-[10px] bottom-[20px] w-[2px]"
              style={{ background: "var(--chart-line)", opacity: 0.55 }}
            />
            <span
              className="absolute bottom-[19px] left-[5px] h-[2px] w-[16px]"
              style={{ background: "var(--accent)" }}
            />
            <span
              className="absolute left-[4px] top-[10px] bottom-[19px] w-[2px]"
              style={{ background: "var(--accent)" }}
            />
            <span
              className="absolute left-[5px] top-[9px] h-[2px] w-[16px]"
              style={{ background: "var(--accent)" }}
            />
            {/* Up chevron at the top of the return riser. */}
            <svg
              className="absolute left-[-1px] top-[4px]"
              width="12"
              height="8"
              viewBox="0 0 12 8"
            >
              <path
                d="M 1 7 L 6 1 L 11 7"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
              />
            </svg>
          </div>

          <ol className="flex flex-col gap-7 pl-12 lg:grid lg:grid-cols-6 lg:gap-x-4 lg:gap-y-0 lg:px-10 lg:pt-9">
            {stages.map((stage, i) => (
              <li
                key={stage.name}
                data-loop-stage
                className="relative text-left lg:text-center"
              >
                {/* Node dot, centered on the track line at lg; in the left
                    gutter on mobile. HTML rather than SVG so it never
                    distorts under the stretched viewBox. */}
                <motion.span
                  aria-hidden
                  className="absolute left-[-34px] top-[3px] block h-[14px] w-[14px] rounded-full lg:left-1/2 lg:top-[-28px] lg:-translate-x-1/2"
                  style={{
                    background: "var(--surface)",
                    boxShadow: "0 0 0 3px var(--accent-soft)",
                  }}
                  initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={draw(0.2 + 0.08 * i, 0.5)}
                />
                {/* Direction chevron on the track at the column boundary. */}
                {i > 0 && (
                  <svg
                    aria-hidden
                    className="absolute left-[-8px] top-[-27px] hidden lg:block"
                    width="9"
                    height="12"
                    viewBox="0 0 9 12"
                  >
                    <path
                      d="M 2 1 L 8 6 L 2 11"
                      fill="none"
                      stroke="var(--chart-line)"
                      strokeWidth="2"
                    />
                  </svg>
                )}

                <motion.span
                  className="block font-display text-lg font-semibold tracking-tight"
                  style={{ color: "var(--text)" }}
                  initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={draw(0.2 + 0.08 * i, 0.5)}
                >
                  {stage.name}
                </motion.span>

                <Reveal delay={0.35 + 0.06 * i}>
                  <div className="mt-3" data-produces>
                    <span
                      className="block font-sans text-[10px] uppercase tracking-[0.2em]"
                      style={{ color: "var(--accent)" }}
                    >
                      Produces
                    </span>
                    <span
                      className="mt-1 block text-[0.85rem] leading-snug"
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
                      className="mt-1 block text-[0.85rem] leading-snug"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {stage.advances}
                    </span>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>

          {/* The return band: the circuit's bottom run passes through its
              vertical center, and the label sits in the path's gap. No ↻
              glyph anywhere — neither display face carries it, so it fell
              back to a font that drew it below the baseline; the direction
              is drawn geometry instead. */}
          <div data-loop-return className="relative mt-3 flex h-10 items-center justify-center">
            <motion.span
              className="font-sans text-[11px] uppercase tracking-[0.24em]"
              style={{ color: "var(--accent)" }}
              initial={{ opacity: reduceMotion ? 1 : 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={draw(1.7, 0.5)}
            >
              evidence from use
            </motion.span>
          </div>

          {/* Arrowhead where the return rejoins the track, pointing at Spec. */}
          <motion.svg
            aria-hidden
            className="absolute left-[14px] top-[9px] hidden lg:block"
            width="9"
            height="12"
            viewBox="0 0 9 12"
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={draw(1.7, 0.5)}
          >
            <path
              d="M 2 1 L 8 6 L 2 11"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
            />
          </motion.svg>
        </div>

        <SectionTail section={section} />
      </div>
    </>
  );
}
