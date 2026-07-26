"use client";

import { useRef } from "react";
import { useScroll } from "motion/react";
import { Glow, VideoBackdrop } from "@/components/core/ParallaxLayer";
import { AccentTitle, NeuBadge, Reveal } from "@/components/neu/Neu";
import { SCurveChart } from "@/components/charts/SCurveChart";
import { GapChasmChart } from "@/components/charts/GapChasmChart";
import { LadderDiagram } from "@/components/charts/LadderDiagram";
import { CONTAINER, type LayoutProps } from "./shared";

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
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const wide = section.chart === "ladder";

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
              {section.kicker && (
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
            </div>

            {/* Diagram column. */}
            <div className="w-full flex-1">
              {section.chart === "scurve" && <SCurveChart progress={scrollYProgress} />}
              {section.chart === "gap" && <GapChasmChart progress={scrollYProgress} />}
              {section.chart === "ladder" && <LadderDiagram progress={scrollYProgress} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
