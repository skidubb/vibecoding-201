"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

const W = 960;
const H = 540;

/**
 * Three lines over time. Agent capability rises, step-by-step instruction from
 * you falls, and outcome definition, guardrails, and verification rises with
 * it. The premise slide's whole argument is these directions, so the figure
 * carries no axis values and no legend — each line ends at its own label.
 */
const CAPABILITY = "M 70 418 C 320 404, 600 296, 900 152";
const INSTRUCTION = "M 70 140 C 340 158, 600 336, 900 442";
const VERIFICATION = "M 70 452 C 380 444, 660 288, 900 88";

export function DivergenceChart({ progress }: { progress: MotionValue<number> }) {
  // First beat draws capability against instruction — one statement, two
  // directions. Second beat draws verification. The final beat, the multi-day
  // warning, belongs to the layout: it is registry copy, and SVG text is
  // invisible to innerText, which the content check in
  // tests/registry-integrity.spec.ts reads.
  const capabilityLength = useTransform(progress, [0.05, 0.3], [0, 1]);
  const instructionLength = useTransform(progress, [0.12, 0.34], [0, 1]);
  const verificationLength = useTransform(progress, [0.4, 0.65], [0, 1]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      // max-h keeps the stacked headline + figure + gated kicker inside the
      // chart layout's viewport-height sticky stage at 1280x720.
      className="h-auto max-h-[42vh] w-full"
      role="img"
      aria-label="Three lines over time: agent capability rising, step-by-step instruction from you falling, and outcome definition, guardrails, and verification rising."
    >
      <line x1="60" y1="470" x2="920" y2="470" stroke="var(--chart-grid)" strokeWidth="1" />

      {/* Capability — rising, solid. */}
      <motion.path
        d={CAPABILITY}
        fill="none"
        stroke="var(--chart-line)"
        strokeWidth="3.5"
        strokeLinecap="round"
        style={{ pathLength: capabilityLength }}
      />
      {/* Instruction — falling. Dashed, so the two directions of the same
          color never rest on color alone. */}
      <motion.path
        d={INSTRUCTION}
        fill="none"
        stroke="var(--chart-line)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="7 8"
        style={{ pathLength: instructionLength }}
      />
      {/* Verification — rising, the heaviest stroke on the slide. */}
      <motion.path
        d={VERIFICATION}
        fill="none"
        stroke="var(--chart-accent)"
        strokeWidth="4.5"
        strokeLinecap="round"
        style={{ pathLength: verificationLength }}
      />

      {/* Direct end labels, each fading in with its own line. */}
      <motion.g style={{ opacity: capabilityLength }}>
        <text
          x="898"
          y="178"
          textAnchor="end"
          fill="var(--text)"
          fontSize="15"
          fontWeight="600"
          fontFamily="var(--font-display)"
        >
          Agent capability
        </text>
      </motion.g>
      <motion.g style={{ opacity: instructionLength }}>
        <text
          x="898"
          y="418"
          textAnchor="end"
          fill="var(--text)"
          fontSize="15"
          fontWeight="600"
          fontFamily="var(--font-display)"
        >
          Step-by-step instruction from you
        </text>
      </motion.g>
      <motion.g style={{ opacity: verificationLength }}>
        <text
          x="898"
          y="62"
          textAnchor="end"
          fill="var(--chart-accent)"
          fontSize="15"
          fontWeight="600"
          fontFamily="var(--font-display)"
        >
          Outcome definition, guardrails, verification
        </text>
      </motion.g>
    </svg>
  );
}
