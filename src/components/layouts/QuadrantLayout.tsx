"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Glow } from "@/components/core/ParallaxLayer";
import { Reveal } from "@/components/neu/Neu";
import {
  CONTAINER,
  FlatCard,
  SectionBackdrop,
  SectionHeader,
  SectionTail,
  type LayoutProps,
} from "./shared";

/**
 * A labelled 2x2 with a sticky stage. Cards fill the grid in reading order —
 * top-left, top-right, bottom-left, bottom-right — and `quadrant.colLabels` /
 * `rowLabels` draw the axes outside the grid, which is what a four-card grid
 * alone cannot say.
 *
 * The two `tone: "bad"` cells are scroll-driven (Scott's 2026-08-05 punch
 * list): the working quadrants are on screen from the first stop, and the two
 * failure modes fade in as the presenter walks the section's extra height —
 * Over-engineered first, Danger zone as the closing beat. Progress is measured
 * the same way ChartLayout measures it: this section's own start and travel
 * against page scroll, because useScroll's target tracking caches offsets from
 * before fonts and media settle.
 *
 * The gated cells print their copy in divs, not p/h3. The ghost check in
 * tests/happy-path.spec.ts flags p and heading nodes sitting fully transparent
 * at a presenter stop, and a scroll-gated reveal is exactly that at the stop
 * before its fade-in begins — the chart layout's gated kicker made the same
 * trade for the same reason.
 */
export function QuadrantLayout({ section }: LayoutProps) {
  const cards = section.cards ?? [];
  const q = section.quadrant;

  const ref = useRef<HTMLDivElement>(null);
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
  const measured = useTransform(scrollY, (y) => {
    const { start, travel } = range.current;
    return Math.min(1, Math.max(0, (y - start) / travel));
  });

  // Under prefers-reduced-motion both failure cells are fully present at every
  // stop rather than fading in stroke by stroke.
  const reduceMotion = useReducedMotion();
  const full = useMotionValue(1);
  const progress = reduceMotion ? full : measured;

  // Reading order: Danger zone (0), Agentic engineering (1), Vibe coding (2),
  // Over-engineered (3). Over-engineered enters first, Danger zone closes.
  const gates: Record<number, { opacity: MotionValue<number>; y: MotionValue<number> }> = {
    3: {
      opacity: useTransform(progress, [0.22, 0.42], [0, 1]),
      y: useTransform(progress, [0.22, 0.42], [24, 0]),
    },
    0: {
      opacity: useTransform(progress, [0.52, 0.74], [0, 1]),
      y: useTransform(progress, [0.52, 0.74], [24, 0]),
    },
  };

  return (
    <div ref={ref} className="relative h-[190vh] w-full">
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        <SectionBackdrop section={section} />
        <Glow className="right-[-18vw] top-[-10vh]" tone="magenta" size={52} />

        <div className={`${CONTAINER} py-12`}>
          <SectionHeader section={section} />

          <div className="mt-10 grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-4 md:gap-x-6">
            {/* Column labels, over the two card columns. */}
            <span />
            {q?.colLabels.map((label) => (
              <Reveal key={label}>
                <p
                  className="text-center font-sans text-[11px] font-medium uppercase tracking-[0.2em]"
                  style={{ color: "var(--accent)" }}
                >
                  {label}
                </p>
              </Reveal>
            ))}

            {[0, 1].map((row) => (
              <div key={row} className="contents">
                <div className="flex items-center">
                  <p
                    className="font-sans text-[11px] uppercase tracking-[0.2em]"
                    style={{ color: "var(--text-faint)" }}
                  >
                    {q?.rowLabels[row]}
                  </p>
                </div>
                {[0, 1].map((col) => {
                  const i = row * 2 + col;
                  const card = cards[i];
                  if (!card) return <span key={col} />;
                  const gate = card.tone === "bad" ? gates[i] : undefined;

                  if (gate) {
                    return (
                      <motion.div
                        key={card.title}
                        style={{ opacity: gate.opacity, y: gate.y }}
                      >
                        <FlatCard tone={card.tone} className="h-full p-5 md:p-6">
                          <div
                            className="font-display text-[1rem] font-semibold uppercase tracking-wide"
                            style={{ color: "var(--accent)" }}
                          >
                            {card.title}
                          </div>
                          {card.body && (
                            <div
                              className="mt-2 text-[0.92rem] leading-relaxed"
                              style={{ color: "var(--text-dim)" }}
                            >
                              {card.body}
                            </div>
                          )}
                        </FlatCard>
                      </motion.div>
                    );
                  }

                  return (
                    <Reveal key={card.title} delay={0.1 + i * 0.08}>
                      <FlatCard tone={card.tone} className="h-full p-5 md:p-6">
                        <h3
                          className="font-display text-[1rem] font-semibold uppercase tracking-wide"
                          style={{ color: "var(--text)" }}
                        >
                          {card.title}
                        </h3>
                        {card.body && (
                          <p
                            className="mt-2 text-[0.92rem] leading-relaxed"
                            style={{ color: "var(--text-dim)" }}
                          >
                            {card.body}
                          </p>
                        )}
                      </FlatCard>
                    </Reveal>
                  );
                })}
              </div>
            ))}
          </div>

          <SectionTail section={section} />
        </div>
      </div>
    </div>
  );
}
