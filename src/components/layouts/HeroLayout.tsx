"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ImageBackdrop, Glow } from "@/components/core/ParallaxLayer";
import { NeuBadge, AccentTitle } from "@/components/neu/Neu";
import { Logo } from "./Logo";
import { CONTAINER, Deeper, type LayoutProps } from "./shared";

export function HeroLayout({ section }: LayoutProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // The title recedes as you leave — the first signal that this page has depth.
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    // Not `relative`: the backdrop below must anchor to the section so it fills
    // the padded area edge to edge. The section supplies min-height.
    // pt-12 drops the centered column ~24px so the Pavilion mark overlaid
    // above the eyebrow clears the viewport top on a 900px-tall window.
    <div ref={ref} className="flex w-full items-center pt-12">
      {section.media?.image && (
        <ImageBackdrop
          src={section.media.image}
          speed={section.media.speed}
          // 0.34, not 0.5. The tuning here was set for `threshold`, whose
          // subject sat clear of the type; the doorway render puts a frame and
          // a hand directly behind the headline and at half opacity the two
          // compete. The scrim protects the left column, the opacity settles
          // what the scrim does not reach. (v13 briefly layered a drawn
          // thesis figure here; Scott cut it same-day — the title face is the
          // photograph and the type, nothing else.)
          opacity={0.34}
          focal="72% 35%"
          sideScrim="left"
          preload
        />
      )}
      <Glow className="-left-[12vw] top-[8vh]" tone="lavender" size={62} />
      <Glow className="-right-[16vw] bottom-[2vh]" tone="magenta" size={54} />

      <motion.div style={{ y, opacity }} className={CONTAINER}>
        {/* Pavilion mark, title slide only — the hero is the deck's one use of
            this layout. The section is dark, so the mono (white) variant
            shows. It shares the eyebrow's row so the two stay level. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <NeuBadge accent>{section.eyebrow}</NeuBadge>
          {/* Absolute so the 90px mark hangs above the eyebrow without
              stretching the column — if the column grows, the GO DEEPER
              strip drops below the fold. */}
          <span className="absolute bottom-full left-0 mb-4">
            <Logo brand="pavilion" height={90} />
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 font-display text-[clamp(3.2rem,9vw,8.5rem)] font-semibold leading-[0.94] tracking-[-0.04em]"
          style={{ color: "var(--text)" }}
        >
          {/* Reads the registry. It used to hardcode the title of a deck this
              class no longer gives, which the entry above could not override. */}
          <AccentTitle title={section.title} accent={section.accent} />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mt-9 max-w-xl text-[clamp(1.05rem,1.5vw,1.25rem)] leading-relaxed"
          style={{ color: "var(--text-dim)" }}
        >
          {section.lede}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.44 }}
          className="mt-14 flex flex-col gap-2 font-sans"
        >
          {/* The sponsor mark shares the kicker's line, absolute for the same
              row-height reason as the Pavilion mark above. */}
          <div className="relative">
            <span
              className="text-sm font-medium tracking-wide"
              style={{ color: "var(--text)" }}
            >
              {section.kicker}
            </span>
            <span className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-3">
              <span
                className="text-[10px] uppercase tracking-[0.24em]"
                style={{ color: "var(--text-faint)" }}
              >
                Sponsored by
              </span>
              <Logo brand="base44" height={44} />
            </span>
          </div>
          <span
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{ color: "var(--text-faint)" }}
          >
            {section.footnote}
          </span>
          {section.deeper && (
            <Deeper deeper={section.deeper} sectionId={section.id} />
          )}
        </motion.div>
      </motion.div>

      {/* Scroll affordance — also tells a live audience the keys work. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span
          className="font-sans text-[10px] uppercase tracking-[0.24em]"
          style={{ color: "var(--text-faint)" }}
        >
          Scroll, or press →
        </span>
        <motion.span
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
          className="block h-9 w-[1px]"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--accent-soft))",
          }}
        />
      </motion.div>
    </div>
  );
}
