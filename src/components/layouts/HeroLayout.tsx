"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ImageBackdrop, Glow } from "@/components/core/ParallaxLayer";
import { NeuBadge, AccentTitle } from "@/components/neu/Neu";
import { HeroThesis } from "@/components/charts/HeroThesis";
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
    <div ref={ref} className="flex w-full items-center">
      {section.media?.image && (
        <ImageBackdrop
          src={section.media.image}
          speed={section.media.speed}
          // 0.20, stepped down twice. 0.5 was set for `threshold`, whose
          // subject sat clear of the type; 0.34 settled the doorway render
          // against the headline; v13 adds the thesis figure in the right
          // column, and at 0.34 the photo competes with its line work. At
          // 0.20 the photo reads as atmosphere behind the figure without
          // flattening the hero against the deck's photographic openers.
          opacity={0.2}
          focal="72% 35%"
          sideScrim="left"
          preload
        />
      )}
      <Glow className="-left-[12vw] top-[8vh]" tone="lavender" size={62} />
      <Glow className="-right-[16vw] bottom-[2vh]" tone="magenta" size={54} />

      {/* The thesis figure, in the right column the headline leaves clear.
          Same leave-behind values as the content column so it recedes with
          the type, and hidden below lg, where its labels drop under ~9px.
          z-[5] keeps it beneath the z-10 content container, so a long
          headline overlaps the figure and not the reverse. */}
      <motion.div
        style={{ y, opacity }}
        className="pointer-events-none absolute inset-y-0 right-0 z-[5] hidden w-[48vw] max-w-[720px] items-center pr-[3vw] lg:flex"
      >
        <HeroThesis />
      </motion.div>

      <motion.div style={{ y, opacity }} className={CONTAINER}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <NeuBadge accent>{section.eyebrow}</NeuBadge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          // max-w-[12ch] sets the three-word title as three lines in the left
          // column, which is what leaves the right half clear for the figure.
          className="mt-8 max-w-[12ch] font-display text-[clamp(3.2rem,9vw,8.5rem)] font-semibold leading-[0.94] tracking-[-0.04em]"
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
          <span
            className="text-sm font-medium tracking-wide"
            style={{ color: "var(--text)" }}
          >
            {section.kicker}
          </span>
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
