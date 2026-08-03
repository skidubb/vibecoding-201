"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * The production system under screen B, drawn at the poll reveal.
 *
 * While the poll is unrevealed the whole band is zero-height, aria-hidden and
 * visibility-hidden: the nodes exist in the DOM (the reveal animates them, it
 * never fetches them) without adding a pixel to the card, because
 * tests/malformed-input.spec.ts compares the two screens' geometry and the
 * slide's argument rests on them staying identical. The visibility flip is
 * load-bearing for that file's hidden-nodes test too — clipped children of a
 * zero-height parent keep their own boxes, so overflow alone still counts as
 * visible.
 *
 * Spans throughout, never p or heading tags: the band sits inside the option
 * button's span tree, and the ghost check in tests/happy-path.spec.ts flags
 * low-opacity p/h1-h3 in the viewport. The entrance uses `animate` keyed to
 * `revealed` rather than Reveal — Reveal is whileInView-once and would fire
 * on scroll-by, before anyone has voted.
 */
const NODES = [
  "Database",
  "Identity",
  "Access policy",
  "Job scheduler",
  "Logs",
  "Alert",
  "Owner",
];

export function SystemUnderScreen({ revealed }: { revealed: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <span
      aria-hidden={!revealed}
      className={`block ${revealed ? "mt-3" : "invisible h-0 overflow-hidden"}`}
    >
      {/* The line from the screen's bottom edge down to the band. */}
      <span
        aria-hidden
        className="mx-auto block h-4 w-px"
        style={{
          background: "linear-gradient(180deg, transparent, var(--accent))",
        }}
      />
      <span className="mt-2 flex flex-wrap justify-center gap-2">
        {NODES.map((node, i) => (
          <motion.span
            key={node}
            data-system-node
            initial={false}
            animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                    // Starts after the result bars' 700ms width transition has
                    // mostly landed, so the tally and the system read as one
                    // reveal in two beats rather than a pile-up.
                    delay: revealed ? 0.5 + i * 0.08 : 0,
                  }
            }
            className="neu-inset neu-edge inline-flex items-center gap-2 rounded-full px-3 py-1.5"
          >
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--accent)" }}
            />
            <span className="text-[0.78rem]" style={{ color: "var(--text)" }}>
              {node}
            </span>
          </motion.span>
        ))}
      </span>
    </span>
  );
}
