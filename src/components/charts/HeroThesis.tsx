"use client";

import { motion, useReducedMotion } from "motion/react";

const W = 880;
const H = 620;

/**
 * The title face's figure: a prototype with no foundations on the left, a
 * production system connected to its five foundations on the right, and one
 * narrow route between them. Draws once on mount, sequenced after the
 * headline cascade in HeroLayout (badge .0 / h1 .12 / lede .28 / kicker .44),
 * so the type lands first and the route draws last. All color comes from
 * theme variables; the labels are SVG text, which innerText never reports —
 * fine here because none of them are registry copy.
 */
const FOUNDATIONS = [
  { label: "Identity", rectX: 585, nodeX: 545 },
  { label: "Data", rectX: 635, nodeX: 618 },
  { label: "Tests", rectX: 685, nodeX: 691 },
  { label: "Monitoring", rectX: 735, nodeX: 766 },
  { label: "Ownership", rectX: 785, nodeX: 845 },
];

const ROUTE = "M 250 340 C 360 318, 450 238, 560 186";

export function HeroThesis() {
  const reduceMotion = useReducedMotion();

  const appear = (delay: number) =>
    reduceMotion
      ? { duration: 0 }
      : { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="A prototype floating with no foundations; across a gap, a production system connected to identity, data, tests, monitoring, and ownership; one narrow route between them."
    >
      <defs>
        <radialGradient id="thesis-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--chart-line)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--chart-line)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="thesis-stub" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-line)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--chart-line)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* The gap: a band of absence between the two structures. */}
      <motion.g
        initial={{ opacity: reduceMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={appear(0.9)}
      >
        <line
          x1="390"
          y1="90"
          x2="390"
          y2="530"
          stroke="var(--chart-grid)"
          strokeWidth="1.5"
          strokeDasharray="5 7"
          opacity="0.5"
        />
        <line
          x1="470"
          y1="90"
          x2="470"
          y2="530"
          stroke="var(--chart-grid)"
          strokeWidth="1.5"
          strokeDasharray="5 7"
          opacity="0.5"
        />
      </motion.g>

      {/* The prototype: lit, floating, and standing on nothing. */}
      <motion.g
        data-thesis="prototype"
        initial={{ opacity: reduceMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={appear(0.5)}
      >
        <motion.g
          animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <ellipse cx="155" cy="426" rx="115" ry="26" fill="url(#thesis-glow)" />
          <rect
            x="60"
            y="280"
            width="190"
            height="120"
            rx="16"
            fill="none"
            stroke="var(--chart-line)"
            strokeWidth="2.5"
          />
          <line
            x1="84"
            y1="316"
            x2="196"
            y2="316"
            stroke="var(--chart-line)"
            strokeWidth="2"
            opacity="0.55"
          />
          <line
            x1="84"
            y1="342"
            x2="226"
            y2="342"
            stroke="var(--chart-line)"
            strokeWidth="2"
            opacity="0.35"
          />
          <line
            x1="84"
            y1="368"
            x2="164"
            y2="368"
            stroke="var(--chart-line)"
            strokeWidth="2"
            opacity="0.35"
          />
          {/* Foundations, absent: two stubs that fade to nothing. */}
          <line
            x1="110"
            y1="402"
            x2="110"
            y2="462"
            stroke="url(#thesis-stub)"
            strokeWidth="2"
            strokeDasharray="4 6"
          />
          <line
            x1="200"
            y1="402"
            x2="200"
            y2="462"
            stroke="url(#thesis-stub)"
            strokeWidth="2"
            strokeDasharray="4 6"
          />
        </motion.g>
        <text
          x="155"
          y="508"
          textAnchor="middle"
          fill="var(--text-dim)"
          fontSize="15"
          fontWeight="600"
          fontFamily="var(--font-display)"
        >
          Prototype
        </text>
      </motion.g>

      {/* The production system and the five foundations it stands on. */}
      <motion.g
        data-thesis="production"
        initial={{ opacity: reduceMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={appear(0.8)}
      >
        <text
          x="685"
          y="92"
          textAnchor="middle"
          fill="var(--text)"
          fontSize="15"
          fontWeight="600"
          fontFamily="var(--font-display)"
        >
          Production system
        </text>
        <rect
          x="560"
          y="110"
          width="250"
          height="150"
          rx="18"
          fill="none"
          stroke="var(--chart-line)"
          strokeWidth="3"
        />
        <line
          x1="588"
          y1="152"
          x2="742"
          y2="152"
          stroke="var(--chart-line)"
          strokeWidth="2"
          opacity="0.55"
        />
        <line
          x1="588"
          y1="180"
          x2="782"
          y2="180"
          stroke="var(--chart-line)"
          strokeWidth="2"
          opacity="0.35"
        />
        <line
          x1="588"
          y1="208"
          x2="700"
          y2="208"
          stroke="var(--chart-line)"
          strokeWidth="2"
          opacity="0.35"
        />
        {FOUNDATIONS.map((f) => (
          <g key={f.label} data-thesis-node>
            <line
              x1={f.rectX}
              y1="260"
              x2={f.nodeX}
              y2="452"
              stroke="var(--chart-line)"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <circle cx={f.nodeX} cy="458" r="5" fill="var(--chart-line)" />
            <text
              x={f.nodeX}
              y="484"
              textAnchor="middle"
              fill="var(--text-dim)"
              fontSize="12.5"
              fontFamily="var(--font-sans)"
            >
              {f.label}
            </text>
          </g>
        ))}
      </motion.g>

      {/* One narrow route across, drawn last. */}
      <motion.path
        data-thesis="bridge"
        d={ROUTE}
        fill="none"
        stroke="var(--chart-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: reduceMotion ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.9, delay: 1.2, ease: [0.16, 1, 0.3, 1] }
        }
      />
    </svg>
  );
}
