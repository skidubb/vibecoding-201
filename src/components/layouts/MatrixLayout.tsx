"use client";

import { Glow } from "@/components/core/ParallaxLayer";
import { NeuPanel, Reveal } from "@/components/neu/Neu";
import { CONTAINER, SectionBackdrop, SectionHeader, SectionTail, type LayoutProps } from "./shared";

/**
 * A comparison table.
 *
 * Ten slides in this deck are grids: the three rungs against the test you can
 * observe, five data doors against what each one costs you, vague against
 * testable. The alignment *is* the argument on every one of them — read a column
 * down and you get the claim — so flattening them into cards loses the thing the
 * slide is for.
 *
 * **One DOM, not two.** The obvious build is a `<table>` for desktop and a card
 * list for mobile, and it is wrong here: duplicated markup makes `innerText` see
 * every cell twice, so `tests/registry-integrity.spec.ts`'s drop-guard passes
 * while the desktop table is broken. Instead the same cells restyle from
 * `table-row` to `block` at `md`, and only the *header string* is reprinted above
 * each stacked cell.
 *
 * Column 0 is a `<th scope="row">`. The bold leading cell is then semantic rather
 * than decorative, which is also why `Matrix` carries no per-row bold flag.
 */
export function MatrixLayout({ section }: LayoutProps) {
  const matrix = section.matrix;
  const head = matrix?.head;
  const rows = matrix?.rows ?? [];

  const cellAlign = (col: number) =>
    matrix?.align?.[col] === "right" ? "text-right tabular-nums" : "text-left";

  return (
    <>
      <SectionBackdrop section={section} />
      <Glow className="right-[-16vw] top-[-8vh]" tone="lavender" size={48} />

      <div className={CONTAINER}>
        <SectionHeader section={section} />

        {/* Definitions above the grid, where a slide has both — the spec slide
            states Job, User and Done, then contrasts vague against testable, and
            the two are different kinds of thing. */}
        {section.cards && section.cards.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {section.cards.map((card, i) => (
              <Reveal key={card.title} delay={0.06 + i * 0.06}>
                <NeuPanel radius="rounded-[24px]" className="flex h-full flex-col p-5 md:p-6">
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
                </NeuPanel>
              </Reveal>
            ))}
          </div>
        )}

        {rows.length > 0 && (
          <Reveal delay={0.12}>
            <div className="neu-inset neu-edge mt-10 rounded-[24px] px-4 py-3 md:px-7 md:py-5">
              <table className="w-full border-collapse">
                {head && (
                  // Chrome on mobile: each cell reprints its own header below,
                  // so a header row there would say everything twice.
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
                      className="block border-b py-3 last:border-b-0 md:table-row md:py-0"
                      style={{ borderColor: "var(--edge)" }}
                    >
                      {cells.map((cell, c) =>
                        c === 0 ? (
                          <th
                            key={`c-${c}`}
                            scope="row"
                            className={`block px-3 py-1 font-display text-[0.98rem] font-semibold leading-snug md:table-cell md:py-4 ${cellAlign(c)}`}
                            style={{ color: "var(--text)" }}
                          >
                            {cell}
                          </th>
                        ) : (
                          <td
                            key={`c-${c}`}
                            className={`block px-3 py-1 text-[0.94rem] leading-relaxed md:table-cell md:py-4 ${cellAlign(c)}`}
                            style={{ color: "var(--text-dim)" }}
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

        <SectionTail section={section} />
      </div>
    </>
  );
}
