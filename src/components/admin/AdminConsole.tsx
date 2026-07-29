"use client";

import { useCallback, useEffect, useState } from "react";
import { sections } from "@/content/sections";
import { supabase } from "@/lib/supabase/client";
import { NeuBadge, NeuPanel } from "@/components/neu/Neu";

/**
 * The operator's side of the class, on one page.
 *
 * Everything here reads through doors that already exist — poll_tallies is the
 * same public aggregate every voter's bars are drawn from, and everything an
 * attendee must not see comes through the admin definer RPCs that answer
 * empty to anyone else. The page's server gate is posture; these are the
 * boundary.
 *
 * Realtime pushes poll changes; a 10-second interval covers the tables the
 * publication does not carry (submissions, events); and the Refresh button is
 * the dropped-websocket insurance — a live class cannot stop to debug one.
 */

type PollState = "closed" | "open" | "revealed";
type PollRow = { slug: string; question: string; state: PollState; sort: number };
type ResultRow = { poll_slug: string; option_id: string; label: string; body: string; votes: number };
type Integrity = { total_votes: number; distinct_accounts: number; new_accounts_60s: number };
type Shared = { id: number; exercise_id: string; body: string; surfaced_at: string | null };
type EventCount = { name: string; section_id: string | null; n: number };
type EventRow = { name: string; section_id: string | null; created_at: string };

const REFRESH_MS = 10_000;

/** The project's analytics page — team slug scottes-projects, per `vercel teams ls`. */
const VERCEL_ANALYTICS_URL = "https://vercel.com/scottes-projects/crossing-the-gap-site/analytics";

/**
 * Exercises that can hold a submission.
 *
 * Timer-only exercises are excluded. Attendees score those against a list on the
 * slide and submit nothing, so including them would add two permanently empty
 * panels to the console, which during class would look like a backend fault.
 */
const EXERCISE_IDS = sections
  .filter((s) => s.exercise && s.exercise.mode !== "timer")
  .map((s) => s.exercise!.id);

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export function AdminConsole() {
  const [polls, setPolls] = useState<PollRow[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [integrity, setIntegrity] = useState<Record<string, Integrity>>({});
  const [shared, setShared] = useState<Shared[]>([]);
  const [eventCounts, setEventCounts] = useState<EventCount[]>([]);
  const [kitCount, setKitCount] = useState<number | null>(null);
  const [log, setLog] = useState<EventRow[]>([]);
  const [lastRead, setLastRead] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshPolls = useCallback(async () => {
    const client = supabase();
    if (!client) return;

    const [{ data: pollRows }, { data: resultRows }] = await Promise.all([
      client.from("polls").select("slug, question, state, sort").order("sort"),
      client.rpc("admin_poll_results"),
    ]);
    const list = (pollRows as PollRow[] | null) ?? [];
    setPolls(list);
    setResults((resultRows as ResultRow[] | null) ?? []);

    const checks = await Promise.all(
      list.map(async (p) => {
        const { data } = await client.rpc("poll_integrity", { p_poll_slug: p.slug });
        return [p.slug, (data as Integrity[] | null)?.[0]] as const;
      }),
    );
    setIntegrity(
      Object.fromEntries(checks.filter(([, v]) => v) as [string, Integrity][]),
    );
  }, []);

  const refreshAll = useCallback(async () => {
    const client = supabase();
    if (!client) return;

    await refreshPolls();

    const [{ data: sharedRows }, { data: counts }, { data: kit }, { data: events }] =
      await Promise.all([
        client
          .from("submissions")
          .select("id, exercise_id, body, surfaced_at")
          .in("exercise_id", EXERCISE_IDS)
          .not("shared_at", "is", null)
          .order("id", { ascending: true }),
        client.rpc("admin_event_counts"),
        client.rpc("admin_kit_requests"),
        client.rpc("recent_events", { p_limit: 50 }),
      ]);
    setShared((sharedRows as Shared[] | null) ?? []);
    setEventCounts((counts as EventCount[] | null) ?? []);
    // The count is rendered; the emails are not. They appear in the CSV
    // export and nowhere else.
    setKitCount(((kit as unknown[] | null) ?? []).length);
    setLog((events as EventRow[] | null) ?? []);
    setLastRead(new Date().toISOString());
  }, [refreshPolls]);

  useEffect(() => {
    const client = supabase();
    if (!client) return;

    void refreshAll();
    const timer = window.setInterval(() => void refreshAll(), REFRESH_MS);

    const channel = client
      .channel("admin-console")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "poll_tallies" },
        () => void refreshPolls(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "polls" },
        () => void refreshPolls(),
      )
      .subscribe();

    return () => {
      window.clearInterval(timer);
      void client.removeChannel(channel);
    };
  }, [refreshAll, refreshPolls]);

  const setPollState = useCallback(
    async (slug: string, next: PollState) => {
      const client = supabase();
      if (!client) return;
      setBusy(true);
      // No optimistic update — a control that shows "open" when the write was
      // rejected is worse than one that takes a beat to answer.
      const { error } = await client.from("polls").update({ state: next }).eq("slug", slug);
      if (!error) await refreshPolls();
      setBusy(false);
    },
    [refreshPolls],
  );

  const surface = useCallback(
    async (row: Shared) => {
      const client = supabase();
      if (!client) return;
      setBusy(true);
      await client
        .from("submissions")
        .update({ surfaced_at: row.surfaced_at ? null : new Date().toISOString() })
        .eq("id", row.id);
      await refreshAll();
      setBusy(false);
    },
    [refreshAll],
  );

  if (!supabase()) return null; // unreachable behind the server gate, kept anyway

  return (
    <main
      data-theme="dark"
      className="min-h-screen px-5 py-14"
      style={{ background: "var(--surface)", color: "var(--text)" }}
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <NeuBadge accent>Vibecoding 201 · presenter console</NeuBadge>
          <div className="flex items-center gap-3">
            {lastRead && (
              <span
                className="font-sans text-[11px] uppercase tracking-[0.14em] tabular-nums"
                style={{ color: "var(--text-faint)" }}
              >
                read {time(lastRead)}
              </span>
            )}
            <button
              type="button"
              data-refresh
              disabled={busy}
              onClick={() => void refreshAll()}
              className="neu-raised neu-edge rounded-full px-4 py-2 font-sans text-[11px] font-medium uppercase tracking-[0.14em] disabled:opacity-40"
              style={{ color: "var(--text)" }}
            >
              Refresh
            </button>
          </div>
        </div>

        <h1 className="mt-6 font-display text-[clamp(1.8rem,5vw,2.6rem)] font-semibold leading-tight">
          The room, while it happens.
        </h1>

        {/* ------------------------------------------------------------ polls */}
        <div className="mt-10 space-y-6">
          {polls.map((poll) => {
            const options = results.filter((r) => r.poll_slug === poll.slug);
            const total = options.reduce((sum, r) => sum + r.votes, 0);
            const check = integrity[poll.slug];
            const stuffed =
              check &&
              check.new_accounts_60s > check.distinct_accounts / 2 &&
              check.distinct_accounts > 4;

            return (
              <NeuPanel key={poll.slug} radius="rounded-[22px]" className="px-6 py-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-[1.15rem] font-semibold leading-snug">
                    {poll.question}
                  </h2>
                  <NeuBadge accent={poll.state === "open"}>{poll.state}</NeuBadge>
                </div>

                <div className="mt-3 flex gap-1">
                  {(["open", "closed", "revealed"] as const).map((to) => (
                    <button
                      key={to}
                      type="button"
                      data-poll-state={`${poll.slug}:${to}`}
                      disabled={busy || poll.state === to}
                      onClick={() => void setPollState(poll.slug, to)}
                      className="rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] disabled:opacity-40"
                      style={{ color: poll.state === to ? "var(--accent)" : "var(--text-dim)" }}
                    >
                      {to === "closed" ? "Close" : to === "open" ? "Open" : "Reveal"}
                    </button>
                  ))}
                </div>

                <ul className="mt-5 space-y-3">
                  {options.map((option) => {
                    const share = total > 0 ? Math.round((option.votes / total) * 100) : 0;
                    return (
                      <li key={option.option_id}>
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="text-[0.95rem]">
                            <span
                              className="font-display font-semibold"
                              style={{ color: "var(--text-dim)" }}
                            >
                              {option.label}{" "}
                            </span>
                            {option.body}
                          </span>
                          <span
                            className="font-sans text-[0.85rem] tabular-nums"
                            style={{ color: "var(--text-dim)" }}
                          >
                            {option.votes} · {share}%
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

                {check && (
                  <p
                    className="mt-4 font-sans text-[12px] uppercase tracking-[0.14em]"
                    style={{ color: "var(--text-faint)" }}
                  >
                    {check.total_votes} {check.total_votes === 1 ? "vote" : "votes"} ·{" "}
                    {check.distinct_accounts} accounts · {check.new_accounts_60s} new in 60s
                    {stuffed ? " ⚠" : ""}
                  </p>
                )}
              </NeuPanel>
            );
          })}
        </div>

        {/* ------------------------------------------------- shared submissions */}
        <NeuPanel radius="rounded-[22px]" className="mt-10 px-6 py-6">
          <h2 className="font-display text-[1.15rem] font-semibold leading-snug">
            Shared with you · {shared.length}
          </h2>
          {shared.length === 0 ? (
            <p className="mt-3 text-[0.9rem]" style={{ color: "var(--text-dim)" }}>
              Nothing yet. Submissions appear here only once their author shares
              them — what the room has written but kept private is not readable
              from this account.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {shared.map((row) => (
                <li key={row.id} className="neu-inset neu-edge rounded-2xl px-4 py-3">
                  <p
                    className="whitespace-pre-wrap text-[0.9rem] leading-relaxed"
                    style={{ color: "var(--text)" }}
                  >
                    {row.body}
                  </p>
                  <button
                    type="button"
                    data-surface={row.id}
                    disabled={busy}
                    onClick={() => void surface(row)}
                    className="mt-3 rounded-full text-[11px] font-medium uppercase tracking-[0.14em] disabled:opacity-40"
                    style={{ color: row.surfaced_at ? "var(--accent)" : "var(--text-dim)" }}
                  >
                    {row.surfaced_at ? "Take it down" : "Put it on screen"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </NeuPanel>

        {/* ---------------------------------------------------------- analytics */}
        <NeuPanel radius="rounded-[22px]" className="mt-6 px-6 py-6">
          <h2 className="font-display text-[1.15rem] font-semibold leading-snug">
            Analytics
          </h2>
          {eventCounts.length === 0 ? (
            <p className="mt-3 text-[0.9rem]" style={{ color: "var(--text-dim)" }}>
              No events yet. Votes, copied prompts and clicked links land here as
              they happen.
            </p>
          ) : (
            <ul className="mt-4 space-y-1.5 font-mono text-[0.82rem]" style={{ color: "var(--text-dim)" }}>
              {eventCounts.map((row) => (
                <li key={`${row.name}-${row.section_id}`} className="flex justify-between gap-4">
                  <span className="truncate">
                    <span style={{ color: "var(--accent)" }}>{row.name}</span>
                    {row.section_id ? ` · ${row.section_id}` : ""}
                  </span>
                  <span className="tabular-nums">{row.n}</span>
                </li>
              ))}
            </ul>
          )}
          <p
            className="mt-4 font-sans text-[12px] uppercase tracking-[0.14em]"
            style={{ color: "var(--text-faint)" }}
          >
            Kit requests: {kitCount ?? "…"} — emails are in the export, not on this page
          </p>
          <a
            href={VERCEL_ANALYTICS_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-block text-[0.9rem] underline underline-offset-4"
            style={{ color: "var(--text-faint)" }}
          >
            Traffic → Vercel Analytics
          </a>
        </NeuPanel>

        {/* ---------------------------------------------------------- event log */}
        <NeuPanel radius="rounded-[22px]" className="mt-6 px-6 py-6">
          <h2 className="font-display text-[1.15rem] font-semibold leading-snug">
            The log
          </h2>
          <ul
            aria-live="polite"
            className="mt-4 max-h-[24rem] overflow-y-auto font-mono text-[0.82rem]"
            style={{ color: "var(--text-dim)" }}
          >
            {log.length === 0 ? (
              <li>nothing yet — the room has not touched anything</li>
            ) : (
              log.map((row, i) => (
                <li key={`${row.created_at}-${i}`} className="truncate py-[3px]">
                  <span style={{ color: "var(--accent)" }}>{row.name}</span>
                  {row.section_id ? ` · ${row.section_id}` : ""}
                  <span style={{ color: "var(--text-faint)" }}>
                    {" · "}
                    {time(row.created_at)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </NeuPanel>

        {/* ------------------------------------------------------------ exports */}
        <NeuPanel radius="rounded-[22px]" className="mt-6 px-6 py-6">
          <h2 className="font-display text-[1.15rem] font-semibold leading-snug">
            Exports
          </h2>
          <div className="mt-4 flex flex-wrap gap-5">
            {(
              [
                ["/admin/export", "Everything"],
                ["/admin/export?set=polls", "Polls"],
                ["/admin/export?set=submissions", "Submissions"],
                ["/admin/export?set=kit", "Kit requests"],
              ] as const
            ).map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="font-sans text-[12px] underline underline-offset-4"
                style={{ color: "var(--text-faint)" }}
              >
                {label}
              </a>
            ))}
          </div>
        </NeuPanel>

        <div className="mt-12 flex gap-6">
          <a
            href="/"
            className="text-[0.9rem] underline underline-offset-4"
            style={{ color: "var(--text-faint)" }}
          >
            Open the deck
          </a>
          <a
            href="/report"
            className="text-[0.9rem] underline underline-offset-4"
            style={{ color: "var(--text-faint)" }}
          >
            Public report
          </a>
          <a
            href="/vote"
            className="text-[0.9rem] underline underline-offset-4"
            style={{ color: "var(--accent)" }}
          >
            Live poll page
          </a>
        </div>
      </div>
    </main>
  );
}
