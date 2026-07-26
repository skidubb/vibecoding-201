"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

const RUNGS = [
  {
    name: "Prototype",
    who: "Prototyper",
    test: "Demonstrates the idea with sample or temporary inputs",
    value: "Creates belief",
  },
  {
    name: "Tool",
    who: "Builder, Grower",
    test: "A defined group reliably completes a real workflow",
    value: "Changes work",
  },
  {
    name: "System",
    who: "Sweeper, Maintainer",
    test: "The workflow operates across teams, data sources, permissions, and time",
    value: "Changes the business",
  },
];

/**
 * Three rungs that rise and light in sequence. Built in HTML rather than SVG:
 * the content is a table of prose, and the neumorphic material has to be the
 * same material as the rest of the page.
 */
export function LadderDiagram({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="flex w-full flex-col gap-4">
      {RUNGS.map((rung, i) => (
        <Rung key={rung.name} rung={rung} index={i} progress={progress} />
      ))}
    </div>
  );
}

function Rung({
  rung,
  index,
  progress,
}: {
  rung: (typeof RUNGS)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const start = 0.1 + index * 0.16;
  const opacity = useTransform(progress, [start, start + 0.12], [0.28, 1]);
  const x = useTransform(progress, [start, start + 0.12], [-24, 0]);
  // Each rung is physically wider than the one below it.
  const width = 80 + index * 10;

  return (
    <motion.div style={{ opacity, x, width: `${width}%` }} className="max-w-full">
      <div className="neu-raised neu-edge relative flex flex-col gap-4 rounded-[20px] px-7 py-5 lg:flex-row lg:items-center lg:gap-10">
        <span
          className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full"
          style={{
            background: index === 2 ? "var(--accent)" : "var(--accent-soft)",
            opacity: index === 0 ? 0.4 : index === 1 ? 0.7 : 1,
          }}
        />
        <div className="lg:w-48 lg:shrink-0">
          <h3
            className="font-display text-2xl font-semibold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            {rung.name}
          </h3>
          <p
            className="mt-1 font-sans text-[11px] uppercase tracking-[0.16em]"
            style={{ color: "var(--accent)" }}
          >
            {rung.who}
          </p>
        </div>

        <div className="flex-1">
          <p
            className="font-sans text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "var(--text-faint)" }}
          >
            Observable test
          </p>
          <p className="mt-1.5 text-[0.94rem] leading-relaxed" style={{ color: "var(--text-dim)" }}>
            {rung.test}
          </p>
        </div>

        <div className="lg:w-44 lg:shrink-0 lg:text-right">
          <p
            className="font-sans text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "var(--text-faint)" }}
          >
            Business value
          </p>
          <p
            className="mt-1.5 font-display text-base font-medium"
            style={{ color: "var(--text)" }}
          >
            {rung.value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
