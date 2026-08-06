"use client";

import { Glow } from "@/components/core/ParallaxLayer";
import { Reveal } from "@/components/neu/Neu";
import { Logo } from "@/components/layouts/Logo";
import { EventFeed } from "@/components/interactive/EventFeed";
import { PromptBlock } from "@/components/interactive/PromptBlock";
import {
  CONTAINER,
  FlatCard,
  SectionBackdrop,
  SectionHeader,
  SectionTail,
  type LayoutProps,
} from "./shared";

/**
 * A comparison table.
 *
 * Eight slides compare items across two or three columns: the three kinds of
 * software against the test that identifies each, five ways to connect to data
 * against what each one costs. Column alignment carries the comparison, so
 * rendering these as cards would lose it.
 *
 * One DOM, not two. A `<table>` for desktop plus a separate card list for mobile
 * duplicates every cell, which makes `innerText` report each one twice and lets
 * the content check in `tests/registry-integrity.spec.ts` pass while the desktop
 * table is broken. Instead the same cells change from `table-row` to `block` at
 * `md`, and only the header string is repeated above each stacked cell.
 *
 * Column 0 is a `<th scope="row">`, so its weight comes from the markup rather
 * than a style rule. That is also why `Matrix` has no per-row bold flag.
 */
export function MatrixLayout({ section }: LayoutProps) {
  const matrix = section.matrix;
  const head = matrix?.head;
  const rows = matrix?.rows ?? [];

  // The emphasized row keeps full text strength on a raised surface with an
  // accent bar in its label cell; every other row's label steps from --text to
  // --text-dim. Both tokens hold the 4.5:1 floor tests/contrast.spec.ts
  // enforces, and opacity is never used for the dimming — the ghost check in
  // happy-path.spec.ts treats low-opacity text as missing content.
  const chosen = matrix?.highlight;

  const cellAlign = (col: number) =>
    matrix?.align?.[col] === "right" ? "text-right tabular-nums" : "text-left";

  return (
    <>
      <SectionBackdrop section={section} />
      <Glow className="right-[-16vw] top-[-8vh]" tone="lavender" size={48} />

      <div className={CONTAINER}>
        <SectionHeader section={section} />

        {/* Definitions above the table, for slides that carry both. The spec
            slide states Job, User and Done, then compares a vague acceptance
            test against a checkable one. */}
        {section.cards && section.cards.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {section.cards.map((card, i) => (
              <Reveal key={card.title} delay={0.06 + i * 0.06}>
                <FlatCard className="flex h-full flex-col p-5 md:p-6">
                  <h3
                    className="font-display text-[1.02rem] font-semibold leading-snug tracking-tight"
                    style={{ color: "var(--text)" }}
                  >
                    {card.title}
                  </h3>
                  {card.body && (
                    <p
                      className="mt-2 text-[0.9rem] leading-relaxed"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {card.body}
                    </p>
                  )}
                </FlatCard>
              </Reveal>
            ))}
          </div>
        )}

        {rows.length > 0 && (
          <Reveal delay={0.12}>
            {/* No inset panel on any table now — Scott's 2026-08-05 rule keeps
                the inset treatment for copyable text and inputs only. `plain`
                is still accepted by the type so old registry entries parse. */}
            <div className="mt-10">
              <table className="w-full border-collapse">
                {head && (
                  // Hidden on mobile: each cell repeats its own header below, so a
                  // header row would state every label twice.
                  <thead className="hidden md:table-header-group">
                    <tr>
                      {head.map((label, c) => (
                        <th
                          key={`h-${c}`}
                          scope="col"
                          className={`border-b px-3 pb-3 font-sans text-[11px] font-medium uppercase tracking-[0.2em] ${cellAlign(c)}`}
                          style={{
                            color: "var(--accent)",
                            borderColor: "var(--edge)",
                          }}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {rows.map((cells, r) => (
                    <tr
                      key={`r-${r}`}
                      data-highlight={r === chosen ? "true" : undefined}
                      className="block border-b py-3 last:border-b-0 md:table-row md:py-0"
                      style={{
                        borderColor: "var(--edge)",
                        background: r === chosen ? "var(--surface-raised)" : undefined,
                      }}
                    >
                      {cells.map((cell, c) =>
                        c === 0 ? (
                          <th
                            key={`c-${c}`}
                            scope="row"
                            className={`block px-3 py-1 font-display text-[0.98rem] font-semibold leading-snug md:table-cell md:py-4 ${cellAlign(c)}`}
                            style={{
                              color:
                                chosen !== undefined && r !== chosen
                                  ? "var(--text-dim)"
                                  : "var(--text)",
                              boxShadow:
                                r === chosen
                                  ? "inset 3px 0 0 var(--accent)"
                                  : undefined,
                            }}
                          >
                            {cell}
                            {/* Platform marks for the row, each linked to its
                                offering. `data-deck-keys="off"` keeps a click
                                from doubling as a deck keypress. */}
                            {(section.rowBrands?.[r]?.length ?? 0) > 0 && (
                              <span className="mt-2 flex flex-wrap items-center gap-3">
                                {section.rowBrands?.[r]?.map((mark) => (
                                  <a
                                    key={mark.brand}
                                    href={mark.href}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    data-deck-keys="off"
                                    className={`${
                                      r === chosen ? "opacity-100" : "opacity-75"
                                    } transition-opacity hover:opacity-100`}
                                  >
                                    <Logo brand={mark.brand} height={15} />
                                  </a>
                                ))}
                              </span>
                            )}
                          </th>
                        ) : (
                          <td
                            key={`c-${c}`}
                            className={`block px-3 py-1 text-[0.94rem] leading-relaxed md:table-cell md:py-4 ${cellAlign(c)}`}
                            style={{
                              color: r === chosen ? "var(--text)" : "var(--text-dim)",
                            }}
                          >
                            {head?.[c] && (
                              <span
                                className="mb-1 block font-sans text-[10px] uppercase tracking-[0.2em] md:hidden"
                                style={{ color: "var(--accent)" }}
                              >
                                {head[c]}
                              </span>
                            )}
                            {cell}
                          </td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        )}

        {/* A prompt the slide asks the reader to run against the table above
            — the context-files slide prints how its files actually get made.
            In a copyable box, never behind a link (Scott's 2026-08-05 punch
            list). */}
        {section.prompts?.map((prompt) => (
          <Reveal key={prompt.id} delay={0.18}>
            <div className="mt-10">
              <PromptBlock
                label={prompt.label}
                text={prompt.text}
                caption={prompt.caption}
              />
            </div>
          </Reveal>
        ))}

        {/* The Run section argues that a tool needs a log. Rather than say so
            and move on, it shows this page's own. Moved here with the section
            when Run became a table of named tools. */}
        {section.id === "run" && <EventFeed />}

        <SectionTail section={section} />
      </div>
    </>
  );
}
