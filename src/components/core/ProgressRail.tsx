"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useState } from "react";
import { sections } from "@/content/sections";
import { useDeck } from "@/lib/deck-context";

/**
 * Fixed navigation rail. Doubles as the presenter's position indicator, so it
 * shows both the section ticks and the source deck's slide number.
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

  const active = sections[activeIndex];

  return (
    <>
      {/* Thin top progress bar — the only element that spans the viewport. */}
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left"
        style={{
          scaleX: progress,
          background: "linear-gradient(90deg, #aba4dc 0%, #df285b 100%)",
        }}
      />

      <nav
        aria-label="Section navigation"
        className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-end gap-3 md:flex"
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
              className="group flex items-center gap-3"
            >
              <span
                className="whitespace-nowrap font-sans text-[11px] uppercase tracking-[0.14em] transition-all duration-300"
                style={{
                  opacity: isHovered || isActive ? 1 : 0,
                  transform: `translateX(${isHovered || isActive ? 0 : 8}px)`,
                  color: isActive ? "#df285b" : "rgba(206,198,244,0.75)",
                }}
              >
                {s.eyebrow ?? s.title}
              </span>
              <motion.span
                animate={{
                  width: isActive ? 30 : 14,
                  backgroundColor: isActive
                    ? "#df285b"
                    : isHovered
                      ? "rgba(206,198,244,0.85)"
                      : "rgba(206,198,244,0.3)",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="block h-[3px] rounded-full"
              />
            </button>
          );
        })}
      </nav>

      {/* Presenter position readout. */}
      <div className="pointer-events-none fixed bottom-6 left-6 z-50 flex items-baseline gap-2 font-sans">
        <span
          className="text-[13px] font-medium tabular-nums"
          style={{ color: "#df285b" }}
        >
          {String(activeIndex + 1).padStart(2, "0")}
        </span>
        <span
          className="text-[11px] tabular-nums"
          style={{ color: "rgba(206,198,244,0.45)" }}
        >
          / {String(total).padStart(2, "0")}
        </span>
        <span
          className="ml-3 text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "rgba(206,198,244,0.35)" }}
        >
          slide {active.slide}
        </span>
      </div>
    </>
  );
}
