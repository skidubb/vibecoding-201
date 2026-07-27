"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Soft-extruded panel. Shadows come from the section's [data-theme] vars. */
export function NeuPanel({
  children,
  variant = "raised",
  className = "",
  radius = "rounded-[28px]",
}: {
  children: ReactNode;
  variant?: "raised" | "inset" | "flat";
  className?: string;
  radius?: string;
}) {
  const material =
    variant === "raised" ? "neu-raised" : variant === "inset" ? "neu-inset" : "neu-flat";
  return (
    <div className={`${material} neu-edge ${radius} ${className}`}>{children}</div>
  );
}

/** Small carved chip used for section numbers, eyebrows and step labels. */
export function NeuBadge({
  children,
  className = "",
  accent = false,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <span
      className={`neu-inset neu-edge inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.18em] ${className}`}
      style={{ color: accent ? "var(--accent)" : "var(--text-dim)" }}
    >
      {children}
    </span>
  );
}

/** The one interactive control on the page. */
export function NeuButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ y: 1, scale: 0.985 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`neu-raised neu-edge rounded-full px-8 py-4 font-display text-sm font-medium tracking-wide ${className}`}
      style={{ color: "var(--text)" }}
    >
      {children}
    </motion.button>
  );
}

/**
 * Entrance reveal. One orchestrated stagger per section beats scattered
 * micro-animations, so children share a single container variant.
 */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Renders a headline, painting `accent` in magenta wherever it appears.
 * Keeps the registry copy as one plain string instead of pre-split fragments.
 */
export function AccentTitle({
  title,
  accent,
  className = "",
}: {
  title: string;
  accent?: string;
  className?: string;
}) {
  if (!accent || !title.includes(accent)) {
    return <span className={className}>{title}</span>;
  }
  const [before, ...rest] = title.split(accent);
  return (
    <span className={className}>
      {before}
      <span style={{ color: "var(--accent)" }}>{accent}</span>
      {rest.join(accent)}
    </span>
  );
}
