"use client";

import { Glow } from "@/components/core/ParallaxLayer";
import { NeuPanel, Reveal } from "@/components/neu/Neu";
import { Logo } from "@/components/layouts/Logo";
import { CONTAINER, SectionBackdrop, SectionHeader, SectionTail, type LayoutProps } from "./shared";

/**
 * The build stack, as a run of stages rather than a grid of cards.
 *
 * The slide names six tools in an order that matters — the order is the
 * argument, and a card grid renders it as six equal choices. Each node also
 * carries a receipt: what *this* site actually did at that step. That is the
 * difference between recommending a stack and having used one, and it is why
 * the first node says out loud that this site skipped it. A slide that claimed
 * six-for-six would be the exact failure the class spends an hour on.
 *
 * Logos are capped at 22px in the row. They are wordmarks of wildly different
 * aspect ratios, and matching their *heights* is what makes a row of them read
 * as one band instead of a ransom note.
 */
export function PipelineLayout({ section }: LayoutProps) {
  const nodes = section.cards ?? [];

  return (
    <>
      <SectionBackdrop section={section} />
      <Glow className="left-[-14vw] bottom-[-12vh]" tone="magenta" size={46} />

      <div className={CONTAINER}>
        <SectionHeader section={section} />

        <ol className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {nodes.map((node, i) => (
            <li key={`${node.title}-${i}`}>
              <Reveal delay={0.06 + i * 0.06}>
                <NeuPanel radius="rounded-[22px]" className="flex h-full flex-col p-5">
                  <div className="flex min-h-[22px] items-center gap-3">
                    {/* The connector. Drawn per node rather than between them,
                        because the row wraps at two breakpoints and a line
                        spanning the gaps would hang off the end of each row. */}
                    <span
                      aria-hidden
                      className="h-px flex-1"
                      style={{ background: "var(--text-faint)", opacity: 0.3 }}
                    />
                    {node.brand && <Logo brand={node.brand} height={22} />}
                  </div>

                  <h3
                    className="mt-4 font-display text-[1.02rem] font-semibold leading-snug tracking-tight"
                    style={{ color: "var(--text)" }}
                  >
                    {node.title}
                  </h3>

                  {node.body && (
                    <p
                      className="mt-2 text-[0.9rem] leading-relaxed"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {node.body}
                    </p>
                  )}

                  {node.receipt && (
                    <p
                      className="mt-auto pt-4 text-[0.85rem] leading-snug"
                      style={{ color: "var(--text-faint)" }}
                    >
                      {node.receipt}
                    </p>
                  )}
                </NeuPanel>
              </Reveal>
            </li>
          ))}
        </ol>

        <SectionTail section={section} />
      </div>
    </>
  );
}
