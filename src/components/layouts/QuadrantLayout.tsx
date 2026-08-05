"use client";

import { Glow } from "@/components/core/ParallaxLayer";
import { Reveal } from "@/components/neu/Neu";
import {
  CONTAINER,
  FlatCard,
  SectionBackdrop,
  SectionHeader,
  SectionTail,
  type LayoutProps,
} from "./shared";

/**
 * A labelled 2x2. Cards fill the grid in reading order — top-left, top-right,
 * bottom-left, bottom-right — and `quadrant.colLabels` / `rowLabels` draw the
 * axes outside the grid, which is what a four-card grid alone cannot say.
 * `tone: "bad"` cells carry the accent border: the failure modes are content,
 * so they are marked in the registry rather than by position here.
 */
export function QuadrantLayout({ section }: LayoutProps) {
  const cards = section.cards ?? [];
  const q = section.quadrant;

  return (
    <>
      <SectionBackdrop section={section} />
      <Glow className="right-[-18vw] top-[-10vh]" tone="magenta" size={52} />

      <div className={CONTAINER}>
        <SectionHeader section={section} />

        <div className="mt-10 grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-4 md:gap-x-6">
          {/* Column labels, over the two card columns. */}
          <span />
          {q?.colLabels.map((label) => (
            <Reveal key={label}>
              <p
                className="text-center font-sans text-[11px] font-medium uppercase tracking-[0.2em]"
                style={{ color: "var(--accent)" }}
              >
                {label}
              </p>
            </Reveal>
          ))}

          {[0, 1].map((row) => (
            <div key={row} className="contents">
              <div className="flex items-center">
                <p
                  className="font-sans text-[11px] uppercase tracking-[0.2em]"
                  style={{ color: "var(--text-faint)" }}
                >
                  {q?.rowLabels[row]}
                </p>
              </div>
              {[0, 1].map((col) => {
                const card = cards[row * 2 + col];
                if (!card) return <span key={col} />;
                return (
                  <Reveal key={card.title} delay={0.1 + (row * 2 + col) * 0.08}>
                    <FlatCard tone={card.tone} className="h-full p-5 md:p-6">
                      <h3
                        className="font-display text-[1rem] font-semibold uppercase tracking-wide"
                        style={{
                          color: card.tone === "bad" ? "var(--accent)" : "var(--text)",
                        }}
                      >
                        {card.title}
                      </h3>
                      {card.body && (
                        <p
                          className="mt-2 text-[0.92rem] leading-relaxed"
                          style={{ color: "var(--text-dim)" }}
                        >
                          {card.body}
                        </p>
                      )}
                    </FlatCard>
                  </Reveal>
                );
              })}
            </div>
          ))}
        </div>

        <SectionTail section={section} />
      </div>
    </>
  );
}
