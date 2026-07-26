"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

const W = 900;
const H = 500;

/**
 * The curve sits in the lower two-thirds on purpose: the top 120px is a label
 * band, so phase captions never collide with the steep middle of the rise.
 */
const CURVE = "M 70 420 C 250 418, 300 385, 400 285 S 570 150, 830 140";

/** curveY values are sampled from the path above so leaders land on the line. */
const PHASES = [
  { x: 175, curveY: 413, label: "Slow", note: "Ideas tried fast, most thrown away" },
  { x: 440, curveY: 247, label: "Fast", note: "Real data, real users, real adoption" },
  { x: 745, curveY: 145, label: "Flat", note: "Owned, secure, reliable, for years" },
];

export function SCurveChart({ progress }: { progress: MotionValue<number> }) {
  // The line draws across the first ~70% of travel; captions land behind it.
  const pathLength = useTransform(progress, [0.05, 0.72], [0, 1]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="An S-curve moving through three phases: slow, then fast, then flat."
    >
      {/* Recessive axes. */}
      <line x1="70" y1="440" x2="850" y2="440" stroke="var(--chart-grid)" strokeWidth="1" />
      <line x1="70" y1="40" x2="70" y2="440" stroke="var(--chart-grid)" strokeWidth="1" />

      {/* Ghost of the full path, so the shape is implied before it draws. */}
      <path d={CURVE} fill="none" stroke="var(--chart-grid)" strokeWidth="2" strokeLinecap="round" />

      <motion.path
        d={CURVE}
        fill="none"
        stroke="var(--chart-line)"
        strokeWidth="3"
        strokeLinecap="round"
        style={{ pathLength }}
      />

      {PHASES.map((phase, i) => (
        <PhaseLabel
          key={phase.label}
          progress={progress}
          start={0.2 + i * 0.18}
          phase={phase}
        />
      ))}

      {/* Direct axis captions — one line, so no legend box. */}
      <text
        x="70"
        y="470"
        fill="var(--text-faint)"
        fontSize="11.5"
        fontFamily="var(--font-sans)"
        letterSpacing="1.8"
      >
        TIME
      </text>
      <text
        x="850"
        y="470"
        textAnchor="end"
        fill="var(--text-faint)"
        fontSize="11.5"
        fontFamily="var(--font-sans)"
        letterSpacing="1.8"
      >
        CAPABILITY / ADOPTION
      </text>
    </svg>
  );
}

function PhaseLabel({
  progress,
  start,
  phase,
}: {
  progress: MotionValue<number>;
  start: number;
  phase: (typeof PHASES)[number];
}) {
  const opacity = useTransform(progress, [start, start + 0.1], [0, 1]);
  const y = useTransform(progress, [start, start + 0.1], [10, 0]);

  return (
    <motion.g style={{ opacity, y }}>
      {/* Leader from the caption band down to the point on the curve. */}
      <line
        x1={phase.x}
        y1={100}
        x2={phase.x}
        y2={phase.curveY - 11}
        stroke="var(--chart-grid)"
        strokeWidth="1.5"
        strokeDasharray="3 4"
      />
      <circle
        cx={phase.x}
        cy={phase.curveY}
        r="5.5"
        fill="var(--chart-accent)"
        stroke="var(--surface)"
        strokeWidth="2"
      />
      <text
        x={phase.x}
        y="56"
        textAnchor="middle"
        fill="var(--text)"
        fontSize="27"
        fontWeight="600"
        fontFamily="var(--font-display)"
      >
        {phase.label}
      </text>
      <text
        x={phase.x}
        y="80"
        textAnchor="middle"
        fill="var(--text-dim)"
        fontSize="12.5"
        fontFamily="var(--font-sans)"
      >
        {phase.note}
      </text>
    </motion.g>
  );
}
