"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { NeuPanel, Reveal } from "@/components/neu/Neu";
import { CONTAINER, SectionHeader, type LayoutProps } from "./shared";

/**
 * Jordan's week. The spine draws itself as you scroll and turns magenta once
 * the week goes wrong, so the decline is legible before you read a word.
 */
export function TimelineLayout({ section }: LayoutProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.75", "end 0.55"],
  });
  const spineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className={CONTAINER}>
      <SectionHeader section={section} />

      <div ref={ref} className="relative mt-10 pl-8 md:pl-0">
        {/* The spine: a carved channel with a drawing fill. */}
        <div
          className="absolute bottom-2 left-[7px] top-2 w-[3px] rounded-full md:left-[calc(9rem+7px)]"
          style={{ background: "var(--shadow-dark)", opacity: 0.35 }}
        />
        <motion.div
          className="absolute left-[7px] top-2 w-[3px] rounded-full md:left-[calc(9rem+7px)]"
          style={{
            height: spineHeight,
            background:
              "linear-gradient(180deg, var(--accent-soft) 0%, var(--accent) 100%)",
          }}
        />

        <div className="flex flex-col gap-5">
          {section.timeline?.map((stop, i) => (
            <Reveal key={stop.day} delay={0.05 + i * 0.06}>
              <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:gap-10">
                {/* Day label sits left of the spine on desktop. */}
                <div className="md:w-36 md:shrink-0 md:pt-1 md:text-right">
                  <span
                    className="font-sans text-[11px] font-medium uppercase tracking-[0.2em]"
                    style={{
                      color: stop.tone === "bad" ? "var(--accent)" : "var(--text-faint)",
                    }}
                  >
                    {stop.day}
                  </span>
                </div>

                {/* Node on the spine. */}
                <span
                  className="absolute left-[-25px] top-[6px] h-[17px] w-[17px] rounded-full md:left-[calc(9rem-1px)]"
                  style={{
                    background: "var(--surface)",
                    boxShadow:
                      stop.tone === "bad"
                        ? "0 0 0 3px var(--accent), 0 0 22px rgba(223,40,91,0.5)"
                        : "0 0 0 3px var(--accent-soft)",
                  }}
                />

                <div className="flex-1 md:pl-8">
                  <NeuPanel
                    className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:p-6"
                    radius="rounded-[22px]"
                  >
                    <div className="flex-1">
                      <h3
                        className="font-display text-lg font-semibold tracking-tight"
                        style={{ color: "var(--text)" }}
                      >
                        {stop.title}
                      </h3>
                      <p
                        className="mt-2 leading-relaxed"
                        style={{ color: "var(--text-dim)" }}
                      >
                        {stop.body}
                      </p>
                    </div>
                    {stop.image && (
                      <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-[14px] md:h-20 md:w-40">
                        <Image
                          src={stop.image}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, 176px"
                          className="object-cover"
                          style={{
                            filter:
                              stop.tone === "bad"
                                ? "grayscale(0.55) contrast(1.05)"
                                : undefined,
                          }}
                        />
                      </div>
                    )}
                  </NeuPanel>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
