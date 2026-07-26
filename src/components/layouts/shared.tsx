"use client";

import type { Section } from "@/content/sections";
import { AccentTitle, NeuBadge, Reveal } from "@/components/neu/Neu";

export type LayoutProps = { section: Section; index: number };

/** Consistent eyebrow → headline → lede stack used by most layouts. */
export function SectionHeader({
  section,
  align = "left",
  size = "lg",
}: {
  section: Section;
  align?: "left" | "center";
  size?: "lg" | "xl";
}) {
  const centered = align === "center";
  return (
    <div className={`max-w-4xl ${centered ? "mx-auto text-center" : ""}`}>
      {section.eyebrow && (
        <Reveal>
          <NeuBadge>{section.eyebrow}</NeuBadge>
        </Reveal>
      )}
      <Reveal delay={0.08}>
        <h2
          className={`mt-5 font-display font-semibold leading-[1.08] tracking-[-0.025em] text-balance ${
            size === "xl"
              ? "text-[clamp(2.2rem,4.8vw,3.9rem)]"
              : "text-[clamp(1.85rem,3.8vw,3rem)]"
          }`}
          style={{ color: "var(--text)" }}
        >
          <AccentTitle title={section.title} accent={section.accent} />
        </h2>
      </Reveal>
      {section.lede && (
        <Reveal delay={0.16}>
          <p
            className={`mt-5 max-w-2xl text-[clamp(0.98rem,1.2vw,1.08rem)] leading-relaxed ${
              centered ? "mx-auto" : ""
            }`}
            style={{ color: "var(--text-dim)" }}
          >
            {section.lede}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/** Small print: source citations and stage notes from the deck. */
export function Footnote({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mt-10 font-sans text-[11px] uppercase tracking-[0.16em]"
      style={{ color: "var(--text-faint)" }}
    >
      {children}
    </p>
  );
}

/** The load-bearing one-liner that closes a section. */
export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <Reveal delay={0.24}>
      <p
        className="mt-9 max-w-3xl border-l-2 pl-6 font-display text-[clamp(1rem,1.5vw,1.25rem)] font-medium leading-snug text-balance"
        style={{ borderColor: "var(--accent)", color: "var(--text)" }}
      >
        {children}
      </p>
    </Reveal>
  );
}

export const CONTAINER = "relative z-10 mx-auto w-full max-w-[1200px] px-6 md:px-12";
