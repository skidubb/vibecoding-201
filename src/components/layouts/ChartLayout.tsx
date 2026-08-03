"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { Glow, VideoBackdrop } from "@/components/core/ParallaxLayer";
import { AccentTitle, NeuBadge, Reveal } from "@/components/neu/Neu";
import { SCurveChart } from "@/components/charts/SCurveChart";
import { GapChasmChart } from "@/components/charts/GapChasmChart";
import { LadderDiagram } from "@/components/charts/LadderDiagram";
import { DivergenceChart } from "@/components/charts/DivergenceChart";
import { CONTAINER, Deeper, type LayoutProps } from "./shared";

/**
 * Tall section with a sticky viewport-height stage. Scrolling through the extra
 * height drives the diagram's progress instead of moving the diagram, which is
 * what makes the charts feel authored rather than merely animated.
 *
 * Presenter jumps still work: the key handler targets the section top, and the
 * chart's opening state is its first frame.
 */
export function ChartLayout({ section }: LayoutProps) {
  const ref = useRef<HTMLDivElement>(null);

  /**
   * Progress through this section, measured here rather than by `useScroll`'s
   * own target tracking.
   *
   * Target tracking cached offsets from before the fonts and the video
   * backdrop settled and never recovered: at this section's final stop, where
   * the geometry says progress is exactly 1.000, it reported roughly 0. The
   * rungs lit halfway down and were dark again on the beat the presenter
   * actually talks over — and the reveal ran backwards in between.
   *
   * Page-level `useScroll` is reliable (the rail runs on it), so the only
   * thing needed is this section's own start and travel, re-measured on the
   * same signals the stop grid uses.
   */
  const range = useRef({ start: 0, travel: 1 });

  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      range.current = {
        start: el.getBoundingClientRect().top + window.scrollY,
        travel: Math.max(1, el.offsetHeight - window.innerHeight),
      };
    };
    measure();
    // Fonts and media settle after first paint and move everything below them.
    const settle = window.setTimeout(measure, 1200);
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, []);

  const { scrollY } = useScroll();
  const measuredProgress = useTransform(scrollY, (y) => {
    const { start, travel } = range.current;
    return Math.min(1, Math.max(0, (y - start) / travel));
  });

  // Under prefers-reduced-motion the section still gets its stops but nothing
  // should draw stroke by stroke, so the charts receive a constant 1 and every
  // beat, including the gated kicker below, is fully present at every stop.
  const reduceMotion = useReducedMotion();
  const fullProgress = useMotionValue(1);
  const scrollYProgress = reduceMotion ? fullProgress : measuredProgress;

  // The ladder's rungs and the divergence figure's two-sentence headline both
  // need the full container width; the 34% copy column wraps them illegibly at
  // projector size.
  const wide = section.chart === "ladder" || section.chart === "divergence";

  // On the divergence slide the kicker is the figure's final beat rather than
  // part of the entrance. It renders once, below the figure, as an
  // opacity-gated div: a `p` at low opacity trips the ghost check in
  // tests/happy-path.spec.ts, and `display: none` would drop the copy from
  // innerText, which the content check in tests/registry-integrity.spec.ts
  // reads.
  const gatedKicker = section.chart === "divergence";
  const kickerOpacity = useTransform(scrollYProgress, [0.78, 0.92], [0, 1]);

  return (
    <div ref={ref} className="relative h-[260vh] w-full">
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        {section.media?.video && (
          <VideoBackdrop
            src={section.media.video}
            poster={section.media.poster}
            speed={section.media.speed}
            opacity={section.chart === "gap" ? 0.36 : 0.24}
          />
        )}
        <Glow className="left-[-16vw] top-[-6vh]" tone="lavender" size={56} />

        <div className={`${CONTAINER} py-12`}>
          <div
            className={
              // The ladder's rungs are full-width prose rows; stacking the copy
              // above them beats squeezing three text columns into 66%.
              wide
                ? "flex flex-col gap-8"
                : "flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16"
            }
          >
            {/* Copy column stays put while the diagram plays. */}
            <div className={wide ? "max-w-3xl" : "lg:w-[34%] lg:shrink-0"}>
              <Reveal>
                <NeuBadge>{section.eyebrow}</NeuBadge>
              </Reveal>
              <Reveal delay={0.08}>
                <h2
                  className="mt-6 font-display text-[clamp(1.9rem,3.5vw,3rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-balance"
                  style={{ color: "var(--text)" }}
                >
                  <AccentTitle title={section.title} accent={section.accent} />
                </h2>
              </Reveal>
              {section.lede && (
                <Reveal delay={0.16}>
                  <p
                    className="mt-5 text-[0.98rem] leading-relaxed"
                    style={{ color: "var(--text-dim)" }}
                  >
                    {section.lede}
                  </p>
                </Reveal>
              )}
              {section.kicker && !gatedKicker && (
                <Reveal delay={0.22}>
                  <p
                    className="mt-7 border-l-2 pl-5 font-display text-[1rem] font-medium leading-snug"
                    style={{ borderColor: "var(--accent)", color: "var(--text)" }}
                  >
                    {section.kicker}
                  </p>
                </Reveal>
              )}
              {section.footnote && (
                <p
                  className="mt-8 font-sans text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: "var(--text-faint)" }}
                >
                  {section.footnote}
                </p>
              )}
              {section.deeper && !gatedKicker && (
                <Deeper deeper={section.deeper} sectionId={section.id} />
              )}
            </div>

            {/* Diagram column. */}
            <div className="w-full flex-1">
              {section.chart === "scurve" && <SCurveChart progress={scrollYProgress} />}
              {section.chart === "gap" && <GapChasmChart progress={scrollYProgress} />}
              {section.chart === "ladder" && <LadderDiagram progress={scrollYProgress} />}
              {section.chart === "divergence" && (
                <DivergenceChart progress={scrollYProgress} />
              )}
            </div>

            {gatedKicker && (
              <div className="w-full">
                {section.kicker && (
                  <motion.div
                    className="border-l-2 pl-5 font-display text-[1.05rem] font-medium leading-snug"
                    style={{
                      borderColor: "var(--accent)",
                      color: "var(--text)",
                      opacity: kickerOpacity,
                    }}
                  >
                    {section.kicker}
                  </motion.div>
                )}
                {section.deeper && (
                  <Deeper deeper={section.deeper} sectionId={section.id} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
