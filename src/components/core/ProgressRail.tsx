"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useState } from "react";
import { sections } from "@/content/sections";
import { useDeck } from "@/lib/deck-context";

/**
 * Fixed navigation rail. Doubles as the presenter's position indicator: the
 * bottom-left readout shows position in this deck and nothing else — the
 * source deck's slide numbering is deliberately not mirrored here.
 */
export function ProgressRail() {
  const { activeIndex, goToIndex, total } = useDeck();
  const [hovered, setHovered] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <>
      {/* Thin top progress bar — the only element that spans the viewport. */}
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left"
        style={{
          scaleX: progress,
          background:
            "linear-gradient(90deg, var(--chart-line) 0%, var(--accent) 100%)",
        }}
      />

      {/* No flex gap: spacing is padding inside each tick instead, so the whole
          rail is a contiguous click target and forty ticks still fit on a
          720px screen. A gap here is both dead space and dead height. */}
      <nav
        aria-label="Section navigation"
        className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-end md:flex"
      >
        {sections.map((s, i) => {
          const isActive = i === activeIndex;
          const isHovered = hovered === i;
          return (
            <button
              key={s.id}
              onClick={() => goToIndex(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              aria-label={`Go to ${s.title}`}
              aria-current={isActive ? "true" : undefined}
              className="group relative flex w-[30px] items-center justify-end py-[6px]"
            >
              {/* Out of flow, and deliberately not hit-testable. In flow its
                  line box — not the tick — set the row height, which is what
                  pushed the rail off screen at forty sections; and while
                  invisible it still swallowed clicks meant for the page. */}
              {/* Truncated: sections with no eyebrow fall back to the title,
                  and the claim slides' titles are whole sentences — the breach
                  test printed its entire headline across the slide in magenta
                  caps beside the rail. */}
              <span
                className="pointer-events-none absolute right-full top-1/2 mr-3 max-w-[16rem] truncate font-sans text-[11px] uppercase tracking-[0.14em] transition-all duration-300"
                style={{
                  opacity: isHovered || isActive ? 1 : 0,
                  transform: `translate(${isHovered || isActive ? 0 : 8}px, -50%)`,
                  color: isActive ? "var(--accent)" : "var(--text-dim)",
                }}
              >
                {s.railLabel ?? s.eyebrow ?? s.title}
              </span>
              {/* Width springs; colour crossfades in CSS, because Motion
                  cannot interpolate between two var() values. */}
              <motion.span
                animate={{ width: isActive ? 30 : 14 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="block h-[3px] rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: isActive ? "var(--accent)" : "var(--text-dim)",
                  opacity: isActive ? 1 : isHovered ? 0.85 : 0.35,
                }}
              />
            </button>
          );
        })}
      </nav>

      {/* Presenter position readout. */}
      <div className="pointer-events-none fixed bottom-6 left-6 z-50 flex items-baseline gap-2 font-sans">
        <span
          className="text-[13px] font-medium tabular-nums"
          style={{ color: "var(--accent)" }}
        >
          {String(activeIndex + 1).padStart(2, "0")}
        </span>
        <span
          className="text-[11px] tabular-nums"
          style={{ color: "var(--text-faint)" }}
        >
          / {String(total).padStart(2, "0")}
        </span>
      </div>
    </>
  );
}
