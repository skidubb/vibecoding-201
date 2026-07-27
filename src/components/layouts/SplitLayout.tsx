"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Glow } from "@/components/core/ParallaxLayer";
import { NeuPanel, Reveal } from "@/components/neu/Neu";
import { CONTAINER, Footnote, Kicker, SectionHeader, Strip, type LayoutProps } from "./shared";

/**
 * The cold open: two screens that look alike and are worth wildly different
 * amounts. They are deliberately identical in layout so the copy carries the
 * difference — the magenta hairline marks the one that survives Monday.
 */
export function SplitLayout({ section }: LayoutProps) {
  return (
    <>
      <Glow className="left-[-14vw] top-[-8vh]" tone="lavender" size={50} />
      <div className={CONTAINER}>
        <SectionHeader section={section} align="center" />

      <div className="mt-10 grid items-stretch gap-6 md:grid-cols-2 md:gap-8">
        {section.split?.map((pane, i) => {
          const isTool = i === 1;
          return (
            // h-full down the whole chain: the two panes are a comparison, and
            // one body wrapping to a second line bottomed the cards out 26px
            // apart, which reads as a mistake rather than a pair.
            <Reveal key={pane.label} delay={0.1 + i * 0.12} className="h-full">
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className="h-full"
              >
                <NeuPanel className="flex h-full flex-col overflow-hidden">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={pane.image}
                      alt={pane.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      style={{ opacity: isTool ? 0.92 : 0.6 }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: isTool
                          ? "linear-gradient(180deg, rgba(18,22,42,0.1) 0%, rgba(18,22,42,0.75) 100%)"
                          : "linear-gradient(180deg, rgba(18,22,42,0.35) 0%, rgba(18,22,42,0.85) 100%)",
                      }}
                    />
                    {isTool && (
                      <span
                        className="absolute inset-x-0 bottom-0 h-[3px]"
                        style={{ background: "var(--accent)" }}
                      />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <span
                      className="font-sans text-[11px] font-medium uppercase tracking-[0.2em]"
                      style={{
                        color: isTool ? "var(--accent)" : "var(--text-faint)",
                      }}
                    >
                      {pane.label}
                    </span>
                    <h3
                      className="mt-2.5 font-display text-xl font-semibold tracking-tight"
                      style={{ color: "var(--text)" }}
                    >
                      {pane.title}
                    </h3>
                    <p
                      className="mt-3 leading-relaxed"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {pane.body}
                    </p>
                  </div>
                </NeuPanel>
              </motion.div>
            </Reveal>
          );
          })}
        </div>

        {section.strip && <Strip {...section.strip} />}
        {section.kicker && <Kicker>{section.kicker}</Kicker>}
        {section.footnote && <Footnote href={section.footnoteHref}>{section.footnote}</Footnote>}
      </div>
    </>
  );
}
