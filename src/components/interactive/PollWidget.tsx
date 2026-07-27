"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PollOption } from "@/content/sections";
import { backendConfigured, supabase } from "@/lib/supabase/client";
import { logEvent } from "@/lib/events";
import { NeuPanel } from "@/components/neu/Neu";

type Tally = Record<string, number>;
type Status = "loading" | "ready" | "voting" | "voted" | "offline" | "error";

/** What the database says a poll is doing right now. */
type PollState = "closed" | "open" | "revealed";

/**
 * A live poll.
 *
 * Five states, and the unhappy ones are the point. The class argues that a tool
 * failing quietly is more dangerous than one failing loudly, and this component
 * is the demonstration standing next to the claim — so a backend that is absent,
 * unreachable, or rejecting a vote all say so in words, and never leave a
 * spinner or a button that appears to have worked.
 *
 * Results are aggregates read from `poll_tallies`, never a count of rows the
 * viewer can see. An attendee cannot read another attendee's vote; that is the
 * cross-organisation test from slide 21, run against data the room just made.
 */
export function PollWidget({
  slug,
  options,
  sectionId,
}: {
  slug: string;
  options: PollOption[];
  sectionId: string;
}) {
  const [status, setStatus] = useState<Status>(
    backendConfigured ? "loading" : "offline",
  );
  const [pollState, setPollState] = useState<PollState>("closed");
  const [tally, setTally] = useState<Tally>({});
  const [chosen, setChosen] = useState<string | null>(null);
  const [correct, setCorrect] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => () => void (mounted.current = false), []);

  const refresh = useCallback(async () => {
    const client = supabase();
    if (!client) return;

    const [{ data: poll }, { data: rows }] = await Promise.all([
      client.from("polls").select("state").eq("slug", slug).maybeSingle(),
      client.from("poll_tallies").select("option_id, votes").eq("poll_slug", slug),
    ]);

    if (!mounted.current) return;

    const next: Tally = {};
    for (const row of rows ?? []) next[row.option_id as string] = row.votes as number;
    setTally(next);

    const state = (poll?.state as PollState) ?? "closed";
    setPollState(state);

    if (state === "revealed") {
      const { data } = await client.rpc("poll_reveal", { p_poll_slug: slug });
      if (mounted.current) setCorrect(data?.[0]?.correct_option_id ?? null);
    }
  }, [slug]);

  useEffect(() => {
    const client = supabase();
    if (!client) return;

    let cancelled = false;

    (async () => {
      try {
        const { data: session } = await client.auth.getSession();
        if (session.session) {
          const { data: mine } = await client
            .from("votes")
            .select("option_id")
            .eq("poll_slug", slug)
            .maybeSingle();
          if (!cancelled && mine) {
            setChosen(mine.option_id as string);
          }
        }
        await refresh();
        if (!cancelled) setStatus((s) => (s === "loading" ? "ready" : s));
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Live results are unavailable. The question still stands.");
        }
      }
    })();

    // One channel per poll. Tally rows and the poll's own state both arrive
    // here, so a reveal reaches every attendee without anyone refreshing.
    const channel = client
      .channel(`poll:${slug}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "poll_tallies", filter: `poll_slug=eq.${slug}` },
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "polls", filter: `slug=eq.${slug}` },
        () => void refresh(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      void client.removeChannel(channel);
    };
  }, [slug, refresh]);

  async function vote(optionId: string) {
    const client = supabase();
    if (!client) return;

    setStatus("voting");
    setMessage(null);

    try {
      let { data: session } = await client.auth.getSession();
      if (!session.session) {
        // Anonymous sign-in keeps a real session, a real user id and real
        // row-level security — it removes the email step, not the auth.
        const { error } = await client.auth.signInAnonymously();
        if (error) throw error;
        ({ data: session } = await client.auth.getSession());
      }

      const { data, error } = await client.rpc("cast_vote", {
        p_poll_slug: slug,
        p_option_id: optionId,
      });
      if (error) throw error;

      switch (data as string) {
        case "ok":
          setChosen(optionId);
          setStatus("voted");
          logEvent("poll_voted", sectionId, { poll: slug });
          await refresh();
          break;
        case "already_voted":
          setChosen(optionId);
          setStatus("voted");
          setMessage("You have already voted in this one.");
          break;
        case "poll_closed":
          setStatus("ready");
          setMessage("This poll is not open yet.");
          break;
        default:
          setStatus("error");
          setMessage("That vote did not go through. Nothing was recorded.");
      }
    } catch {
      if (!mounted.current) return;
      setStatus("error");
      setMessage("That vote did not go through. Nothing was recorded.");
    }
  }

  const total = Object.values(tally).reduce((a, b) => a + b, 0);
  const showResults = chosen !== null || pollState === "revealed";
  const locked = status === "voting" || chosen !== null || pollState !== "open";

  return (
    <div data-deck-keys="off" className="mt-10">
      <ul className="grid gap-3">
        {options.map((option) => {
          const count = tally[option.id] ?? 0;
          const share = total > 0 ? Math.round((count / total) * 100) : 0;
          const isChosen = chosen === option.id;
          const isCorrect = correct === option.id;

          return (
            <li key={option.id}>
              <button
                type="button"
                disabled={locked}
                onClick={() => vote(option.id)}
                data-option={option.id}
                aria-pressed={isChosen}
                className="w-full text-left disabled:cursor-default"
              >
                <NeuPanel
                  variant={isChosen ? "inset" : "flat"}
                  radius="rounded-2xl"
                  className="relative overflow-hidden px-5 py-4"
                >
                  {/* The result bar sits behind the text so the option stays
                      readable at every share, including 100%. */}
                  {showResults && (
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-out"
                      style={{
                        width: `${share}%`,
                        background: isCorrect
                          ? "var(--accent)"
                          : "var(--chart-line)",
                        opacity: isCorrect ? 0.28 : 0.16,
                      }}
                    />
                  )}

                  <span className="relative flex items-baseline gap-3">
                    <span
                      className="font-display text-[0.8rem] font-semibold"
                      style={{ color: isCorrect ? "var(--accent)" : "var(--text-dim)" }}
                    >
                      {option.label}
                    </span>
                    <span className="flex-1" style={{ color: "var(--text)" }}>
                      {option.body}
                    </span>
                    {showResults && (
                      <span
                        className="font-sans text-[0.85rem] tabular-nums"
                        style={{ color: "var(--text-dim)" }}
                      >
                        {share}%
                      </span>
                    )}
                  </span>
                </NeuPanel>
              </button>
            </li>
          );
        })}
      </ul>

      <p
        aria-live="polite"
        className="mt-4 text-[0.9rem]"
        style={{ color: status === "error" ? "var(--accent)" : "var(--text-dim)" }}
      >
        {status === "offline"
          ? "Voting is offline. Results are published after the live session."
          : (message ??
            (pollState === "revealed"
              ? "Revealed."
              : showResults
                ? `${total} ${total === 1 ? "vote" : "votes"} so far. One vote per signed-in account, enforced by a primary key in Postgres.`
                : pollState === "open"
                  ? "Pick one."
                  : "This poll opens during the session."))}
      </p>
    </div>
  );
}
