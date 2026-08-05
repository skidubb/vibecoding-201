"use client";

import { Glow } from "@/components/core/ParallaxLayer";
import { Reveal } from "@/components/neu/Neu";
import { Logo } from "@/components/layouts/Logo";
import {
  CONTAINER,
  FlatCard,
  SectionBackdrop,
  SectionHeader,
  SectionTail,
  type LayoutProps,
} from "./shared";

/**
 * Two flat panels side by side, each a labelled row stack — the closed and
 * open harness compared face to face rather than as table columns. The first
 * row's value renders bold (it names the platforms) and carries the panel's
 * linked marks beneath it.
 */
export function DuoLayout({ section }: LayoutProps) {
  return (
    <>
      <SectionBackdrop section={section} />
      <Glow className="right-[-18vw] top-[-10vh]" tone="magenta" size={52} />

      <div className={CONTAINER}>
        <SectionHeader section={section} />

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {section.duo?.map((panel, p) => (
            <Reveal key={panel.name} delay={0.1 + p * 0.1}>
              <FlatCard className="h-full p-6 md:p-7">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3
                    className="font-display text-[1.25rem] font-semibold tracking-tight"
                    style={{ color: "var(--text)" }}
                  >
                    {panel.name}
                  </h3>
                  {panel.badge && (
                    <p
                      className="font-sans text-[10px] uppercase tracking-[0.18em]"
                      style={{ color: "var(--text-faint)" }}
                    >
                      {panel.badge}
                    </p>
                  )}
                </div>

                <dl className="mt-5">
                  {panel.rows.map((row, i) => (
                    <div
                      key={row.label}
                      className={`gap-1 py-3 md:grid md:grid-cols-[130px_1fr] md:gap-4 ${
                        i > 0 ? "border-t" : ""
                      }`}
                      style={{ borderColor: "var(--edge)" }}
                    >
                      <dt
                        className="font-sans text-[10px] uppercase tracking-[0.18em]"
                        style={{
                          color: i === 0 ? "var(--accent)" : "var(--text-faint)",
                        }}
                      >
                        {row.label}
                      </dt>
                      <dd>
                        <p
                          className={
                            i === 0
                              ? "font-display text-[1.02rem] font-semibold"
                              : "text-[0.92rem] leading-relaxed"
                          }
                          style={{
                            color: i === 0 ? "var(--text)" : "var(--text-dim)",
                          }}
                        >
                          {row.value}
                        </p>
                        {i === 0 && panel.brands && panel.brands.length > 0 && (
                          <span className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                            {panel.brands.map((mark) => (
                              <a
                                key={mark.brand}
                                href={mark.href}
                                target="_blank"
                                rel="noreferrer noopener"
                                data-deck-keys="off"
                                className="inline-flex opacity-80 transition-opacity hover:opacity-100"
                              >
                                <Logo brand={mark.brand} height={18} />
                              </a>
                            ))}
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </FlatCard>
            </Reveal>
          ))}
        </div>

        <SectionTail section={section} />
      </div>
    </>
  );
}
