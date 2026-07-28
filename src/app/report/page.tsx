"use client";

import { useCallback, useEffect, useState } from "react";
import { sections } from "@/content/sections";
import { backendConfigured, supabase } from "@/lib/supabase/client";
import { NeuBadge, NeuPanel } from "@/components/neu/Neu";

/**
 * What the room actually did, after the fact.
 *
 * Public and unauthenticated, and it can be because it reads only aggregates:
 * `poll_tallies` is granted to anon by design, and a tally is not a vote. No
 * submissions here at any privacy setting — the room shared those with a room,
 * which is not the same as publishing them to the internet, and the difference
 * is the whole argument of the exercise.
 *
 * It shows nothing until a poll is revealed. Someone opening this link during
 * class should not be able to read the results ahead of the room.
 */

type Row = { poll_slug: string; option_id: string; votes: number };

const POLLS = sections.filter((s) => s.poll).map((s) => ({ section: s, poll: s.poll! }));

export default function ReportPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [checked, setChecked] = useState(!backendConfigured);

  const read = useCallback(async () => {
    const client = supabase();
    if (!client) return;
    const [{ data: tallies }, { data: polls }] = await Promise.all([
      client.from("poll_tallies").select("poll_slug, option_id, votes"),
      client.from("polls").select("slug, state").eq("state", "revealed"),
    ]);
    setRows((tallies as Row[] | null) ?? []);
    setRevealed(((polls ?? []) as { slug: string }[]).map((p) => p.slug));
    setChecked(true);
  }, []);

  useEffect(() => {
    const client = supabase();
    if (!client) return;

    void read();

    // A reveal that happens while this tab is open appears without a reload —
    // the same subscription /vote uses — and the button below is the manual
    // insurance for a websocket that quietly dropped.
    const channel = client
      .channel("report")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "polls" },
        () => void read(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "poll_tallies" },
        () => void read(),
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [read]);

  const shown = POLLS.filter((p) => revealed.includes(p.poll.slug));

  return (
    <main
      data-theme="dark"
      className="min-h-screen px-5 py-14"
      style={{ background: "var(--surface)", color: "var(--text)" }}
    >
      <div className="mx-auto w-full max-w-3xl">
        <NeuBadge accent>Vibecoding 201 · what the room said</NeuBadge>

        <h1 className="mt-6 font-display text-[clamp(1.8rem,5vw,2.6rem)] font-semibold leading-tight">
          The results, once they were revealed.
        </h1>
        <p className="mt-4 leading-relaxed" style={{ color: "var(--text-dim)" }}>
          Counts only, and only for polls the presenter has revealed. Nobody&rsquo;s
          vote is readable here, including by us — these are aggregates the
          database publishes, not rows anyone can browse. The specs written
          during the exercise are not on this page at all: those were shared
          with a room, which is not the same as published.
        </p>

        {backendConfigured && (
          <button
            type="button"
            data-refresh
            onClick={() => void read()}
            className="neu-raised neu-edge mt-6 rounded-full px-4 py-2 font-sans text-[11px] font-medium uppercase tracking-[0.14em]"
            style={{ color: "var(--text)" }}
          >
            Refresh
          </button>
        )}

        {!checked ? (
          <p className="mt-10" style={{ color: "var(--text-dim)" }}>
            Reading the tallies…
          </p>
        ) : shown.length === 0 ? (
          <NeuPanel className="mt-10 px-6 py-8">
            <h2 className="font-display text-xl font-semibold">
              Nothing has been revealed yet.
            </h2>
            <p className="mt-3" style={{ color: "var(--text-dim)" }}>
              During the session this page stays empty on purpose — reading the
              answers here while the room is still voting would spoil every one
              of them. Come back afterwards.
            </p>
          </NeuPanel>
        ) : (
          <div className="mt-10 space-y-8">
            {shown.map(({ section, poll }) => {
              const mine = rows.filter((r) => r.poll_slug === poll.slug);
              const total = mine.reduce((sum, r) => sum + r.votes, 0);

              return (
                <NeuPanel key={poll.slug} radius="rounded-[22px]" className="px-6 py-6">
                  <h2 className="font-display text-[1.15rem] font-semibold leading-snug">
                    {section.title}
                  </h2>
                  <ul className="mt-5 space-y-3">
                    {poll.options.map((option) => {
                      const votes = mine.find((r) => r.option_id === option.id)?.votes ?? 0;
                      const share = total > 0 ? Math.round((votes / total) * 100) : 0;
                      return (
                        <li key={option.id}>
                          <div className="flex items-baseline justify-between gap-4">
                            <span className="text-[0.95rem]">
                              <span
                                className="font-display font-semibold"
                                style={{ color: "var(--text-dim)" }}
                              >
                                {option.label}{" "}
                              </span>
                              {option.name ?? option.body}
                            </span>
                            <span
                              className="font-sans text-[0.85rem] tabular-nums"
                              style={{ color: "var(--text-dim)" }}
                            >
                              {share}%
                            </span>
                          </div>
                          <span
                            aria-hidden
                            className="mt-1.5 block h-1.5 rounded-full"
                            style={{
                              width: `${Math.max(share, 1)}%`,
                              background: "var(--chart-line)",
                              opacity: 0.5,
                            }}
                          />
                        </li>
                      );
                    })}
                  </ul>
                  <p
                    className="mt-4 font-sans text-[12px] uppercase tracking-[0.14em]"
                    style={{ color: "var(--text-faint)" }}
                  >
                    {total} {total === 1 ? "vote" : "votes"}
                  </p>
                </NeuPanel>
              );
            })}
          </div>
        )}

        <div className="mt-12 flex gap-6">
          <a
            href="/"
            className="text-[0.9rem] underline underline-offset-4"
            style={{ color: "var(--text-faint)" }}
          >
            Open the full deck
          </a>
          <a
            href="/kit"
            className="text-[0.9rem] underline underline-offset-4"
            style={{ color: "var(--accent)" }}
          >
            Take the kit
          </a>
          <a
            href="/admin"
            className="text-[0.9rem] underline underline-offset-4"
            style={{ color: "var(--text-faint)" }}
          >
            Presenter
          </a>
        </div>
      </div>
    </main>
  );
}
