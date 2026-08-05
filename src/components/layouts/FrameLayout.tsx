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
 * Cards inside a labelled container. The frame is the argument: its corner
 * labels name the whole (the harness, ~90% of the working system) and the one
 * card whose `meta` names its share renders centered and accent-tinted above
 * the rest — the model, small, surrounded by everything that makes it usable.
 */
export function FrameLayout({ section }: LayoutProps) {
  const cards = section.cards ?? [];
  const [featured, ...rest] = cards;

  return (
    <>
      <SectionBackdrop section={section} />
      <Glow className="right-[-18vw] top-[-10vh]" tone="magenta" size={52} />

      <div className={CONTAINER}>
        <SectionHeader section={section} />

        <Reveal delay={0.12}>
          <div
            className="mt-10 rounded-[28px] border p-5 md:p-7"
            style={{
              borderColor: "var(--edge)",
              background: "color-mix(in srgb, var(--surface) 45%, transparent)",
            }}
          >
            <div className="flex items-baseline justify-between gap-4">
              {section.frame?.label && (
                <p
                  className="font-sans text-[11px] font-medium uppercase tracking-[0.2em]"
                  style={{ color: "var(--accent)" }}
                >
                  {section.frame.label}
                </p>
              )}
              {section.frame?.note && (
                <p
                  className="text-right font-sans text-[11px] uppercase tracking-[0.2em]"
                  style={{ color: "var(--text-faint)" }}
                >
                  {section.frame.note}
                </p>
              )}
            </div>

            {featured && (
              <div className="mt-5 flex justify-center">
                <div
                  className="flex w-full max-w-xl items-center gap-5 rounded-[20px] border px-6 py-5"
                  style={{
                    borderColor: "var(--accent)",
                    background: "color-mix(in srgb, var(--accent) 9%, transparent)",
                  }}
                >
                  {featured.meta && (
                    <span
                      className="font-display text-[1.7rem] font-semibold tracking-tight"
                      style={{ color: "var(--accent)" }}
                    >
                      {featured.meta}
                    </span>
                  )}
                  <span>
                    <h3
                      className="font-display text-[1.02rem] font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      {featured.title}
                    </h3>
                    {featured.body && (
                      <p
                        className="mt-1 text-[0.9rem] leading-relaxed"
                        style={{ color: "var(--text-dim)" }}
                      >
                        {featured.body}
                      </p>
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {rest.map((card, i) => (
                <Reveal key={card.title} delay={0.18 + i * 0.07}>
                  <FlatCard className="h-full p-5">
                    <h3
                      className="font-display text-[1rem] font-semibold tracking-tight"
                      style={{ color: "var(--text)" }}
                    >
                      {card.title}
                    </h3>
                    {card.body && (
                      <p
                        className="mt-1.5 text-[0.9rem] leading-relaxed"
                        style={{ color: "var(--text-dim)" }}
                      >
                        {card.body}
                      </p>
                    )}
                  </FlatCard>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>

        <SectionTail section={section} />
      </div>
    </>
  );
}
