"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

const W = 960;
const H = 540;

/**
 * Two S-curves that do not meet. The builder curve climbs from the left and
 * stops; the adopter curve resumes further right and higher. The void between
 * them is the Gap — and the whole point is that it is drawn as absence.
 */
const BUILDER = "M 55 430 C 180 428, 230 400, 305 322 S 370 232, 388 212";
const ADOPTER = "M 632 322 C 700 294, 748 238, 800 168 S 882 108, 918 98";

/** The void spans x 400–620, wide enough to hold its own contents. */
const GAP_X = 400;
const GAP_W = 220;
const GAP_MID = GAP_X + GAP_W / 2;

/** Everything invisible that lives in the void. */
const GAP_ITEMS = [
  "Persistence",
  "Identity & access",
  "Real data",
  "Deployment",
  "Testing",
  "Scheduled work",
  "Monitoring",
  "Ownership",
];

export function GapChasmChart({ progress }: { progress: MotionValue<number> }) {
  // Sequence: builder draws -> adopter draws -> chasm reveals -> contents land.
  const builderLength = useTransform(progress, [0.04, 0.3], [0, 1]);
  const adopterLength = useTransform(progress, [0.22, 0.48], [0, 1]);
  const chasmOpacity = useTransform(progress, [0.42, 0.58], [0, 1]);
  const chasmScale = useTransform(progress, [0.42, 0.62], [0.9, 1]);
  const labelOpacity = useTransform(progress, [0.5, 0.62], [0, 1]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Two curves — what gets built, and who will depend on it — separated by a gap containing the invisible production work."
    >
      <defs>
        <linearGradient id="chasm-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--chart-accent)" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="builder-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="70%" stopColor="var(--chart-line)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--chart-line)" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="adopter-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--chart-line)" stopOpacity="0.25" />
          <stop offset="30%" stopColor="var(--chart-line)" stopOpacity="1" />
        </linearGradient>
      </defs>

      <line x1="60" y1="470" x2="920" y2="470" stroke="var(--chart-grid)" strokeWidth="1" />

      {/* The void. Drawn before the curves so the lines sit on top of it. */}
      <motion.g
        style={{ opacity: chasmOpacity, scaleX: chasmScale, originX: `${GAP_MID}px` }}
      >
        <rect x={GAP_X} y="80" width={GAP_W} height="390" fill="url(#chasm-fill)" />
        <line
          x1={GAP_X}
          y1="80"
          x2={GAP_X}
          y2="470"
          stroke="var(--chart-accent)"
          strokeWidth="2"
          strokeDasharray="5 6"
          opacity="0.7"
        />
        <line
          x1={GAP_X + GAP_W}
          y1="80"
          x2={GAP_X + GAP_W}
          y2="470"
          stroke="var(--chart-accent)"
          strokeWidth="2"
          strokeDasharray="5 6"
          opacity="0.7"
        />
        <text
          x={GAP_MID}
          y="62"
          textAnchor="middle"
          fill="var(--chart-accent)"
          fontSize="19"
          fontWeight="600"
          letterSpacing="4"
          fontFamily="var(--font-display)"
        >
          THE GAP
        </text>
      </motion.g>

      {/* Builder curve — what gets made. */}
      <motion.path
        d={BUILDER}
        fill="none"
        stroke="url(#builder-fade)"
        strokeWidth="3.5"
        strokeLinecap="round"
        style={{ pathLength: builderLength }}
      />
      {/* Adopter curve — who will depend on it. */}
      <motion.path
        d={ADOPTER}
        fill="none"
        stroke="url(#adopter-fade)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="0"
        style={{ pathLength: adopterLength }}
      />

      {/* Direct labels: identity never rests on color alone. */}
      <motion.g style={{ opacity: builderLength }}>
        <text
          x="62"
          y="392"
          fill="var(--text)"
          fontSize="15"
          fontWeight="600"
          fontFamily="var(--font-display)"
        >
          Builder curve
        </text>
        <text x="62" y="412" fill="var(--text-dim)" fontSize="12.5" fontFamily="var(--font-sans)">
          What gets made
        </text>
      </motion.g>
      <motion.g style={{ opacity: adopterLength }}>
        <text
          x="918"
          y="150"
          textAnchor="end"
          fill="var(--text)"
          fontSize="15"
          fontWeight="600"
          fontFamily="var(--font-display)"
        >
          Adopter curve
        </text>
        <text
          x="918"
          y="170"
          textAnchor="end"
          fill="var(--text-dim)"
          fontSize="12.5"
          fontFamily="var(--font-sans)"
        >
          Who will depend on it
        </text>
      </motion.g>

      {/* What actually lives in the void. */}
      <motion.g style={{ opacity: labelOpacity }}>
        {GAP_ITEMS.map((item, i) => (
          <text
            key={item}
            x={GAP_MID}
            y={128 + i * 34}
            textAnchor="middle"
            fill="var(--text-dim)"
            fontSize="13"
            fontFamily="var(--font-sans)"
          >
            {item}
          </text>
        ))}
      </motion.g>
    </svg>
  );
}
