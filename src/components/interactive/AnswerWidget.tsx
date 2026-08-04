"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Card, Exercise } from "@/content/sections";
import { backendConfigured, supabase } from "@/lib/supabase/client";
import { NeuPanel } from "@/components/neu/Neu";

type Status = "offline" | "ready" | "saving" | "saved" | "error";
type Tally = { answer: number; people: number };

/**
 * An exercise that gives something back.
 *
 * Separate from `ExerciseWidget` rather than a fourth branch inside it: that
 * component owns the fifteen-minute spec block, which is the one beat of this
 * hour that already worked, and the writing/submitting/sharing separation it
 * defends is not the shape of these two modes. Nothing here shares, because
 * there is no prose to read out.
 *
 * Both modes store an integer in `submissions.answer`, which a trigger
 * aggregates into `answer_tallies`. The room reads the aggregate and nobody
 * reads anyone's row, the same split `poll_tallies` makes against `votes`.
 *
 * Offline is a supported state, as everywhere else on this deck. The clock, the
 * boxes and the score all work with no backend; only the room's distribution
 * needs one, and its absence is printed rather than hidden.
 */
export function AnswerWidget({
  exercise,
  cards,
}: {
  exercise: Extract<Exercise, { mode: "count" | "checklist" }>;
  cards: Card[];
}) {
  const [remaining, setRemaining] = useState(exercise.seconds);
  const [running, setRunning] = useState(false);

  const [entry, setEntry] = useState("");
  const [checked, setChecked] = useState<number[]>([]);
  const [status, setStatus] = useState<Status>(backendConfigured ? "ready" : "offline");
  const [message, setMessage] = useState<string | null>(null);
  const [mine, setMine] = useState<number | null>(null);
  const [tallies, setTallies] = useState<Tally[]>([]);

  const mounted = useRef(true);
  useEffect(() => () => void (mounted.current = false), []);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const t = window.setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [running, remaining]);

  useEffect(() => {
    if (remaining === 0) setRunning(false);
  }, [remaining]);

  const score = exercise.mode === "checklist" ? checked.length : null;

  // ------------------------------------------------------------- the room
  const refresh = useCallback(async () => {
    const client = supabase();
    if (!client) return;
    // `people > 0` because the trigger decrements rather than deletes: an answer
    // somebody moved away from stays in the table at zero, and rendering it drew
    // a labelled row with an empty bar. One person changing 634 to 834 left a
    // phantom "634 · 0"; two hundred people changing their minds would bury the
    // real distribution in them.
    const { data } = await client
      .from("answer_tallies")
      .select("answer, people")
      .eq("exercise_id", exercise.id)
      .gt("people", 0)
      .order("answer", { ascending: true });
    if (mounted.current) setTallies((data as Tally[] | null) ?? []);
  }, [exercise.id]);

  useEffect(() => {
    const client = supabase();
    if (!client) return;

    void refresh();

    // One channel per exercise, matching the poll's shape. A submission that
    // lands anywhere in the room moves every histogram without a refresh, which
    // is the whole point of showing it live.
    const channel = client
      .channel(`exercise:${exercise.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "answer_tallies",
          filter: `exercise_id=eq.${exercise.id}`,
        },
        () => void refresh(),
      )
      .subscribe();

    return () => void client.removeChannel(channel);
  }, [exercise.id, refresh]);

  // Whatever this person already answered, so a reload does not read as a lost
  // answer and a second submission edits rather than duplicates.
  useEffect(() => {
    const client = supabase();
    if (!client) return;
    let cancelled = false;
    (async () => {
      const { data: session } = await client.auth.getSession();
      if (!session.session || cancelled) return;
      const { data } = await client
        .from("submissions")
        .select("answer, body")
        .eq("exercise_id", exercise.id)
        .eq("user_id", session.session.user.id)
        .maybeSingle();
      if (cancelled || !data || data.answer === null) return;
      setMine(data.answer as number);
      setStatus("saved");
      if (exercise.mode === "count") setEntry(String(data.answer));
    })();
    return () => void (cancelled = true);
  }, [exercise.id, exercise.mode]);

  // ------------------------------------------------------------------ submit
  async function submit() {
    let answer: number;
    let body: string;

    if (exercise.mode === "count") {
      const parsed = Number(entry.trim());
      // Refused here and never sent. The column is an integer, so a decimal or
      // a word would come back as a Postgres error the writer has to decode
      // mid-exercise instead of a sentence telling them what to type.
      if (!entry.trim() || !Number.isInteger(parsed) || parsed < 0) {
        setMessage("A whole number, and nothing else.");
        return;
      }
      answer = parsed;
      body = String(parsed);
    } else {
      answer = checked.length;
      const missing = cards.filter((_, i) => !checked.includes(i)).map((c) => c.title);
      body = missing.length ? missing.join("\n") : "Nothing left unchecked.";
    }

    // Not a disabled button, for the reason the spec block gives: the suite runs
    // with the backend off and a greyed-out control explains nothing.
    const client = supabase();
    if (!client) {
      setMine(answer);
      setMessage("Saving is offline. Your score is on screen. Write it down.");
      return;
    }

    setStatus("saving");
    setMessage(null);

    try {
      let { data: session } = await client.auth.getSession();
      if (!session.session) {
        const { error } = await client.auth.signInAnonymously();
        if (error) throw error;
        ({ data: session } = await client.auth.getSession());
      }
      const userId = session.session?.user.id;
      if (!userId) throw new Error("no session");

      const { error } = await client
        .from("submissions")
        .upsert(
          { exercise_id: exercise.id, user_id: userId, body, answer },
          { onConflict: "exercise_id,user_id" },
        );
      if (error) throw error;

      if (!mounted.current) return;
      setMine(answer);
      setStatus("saved");
      setMessage(null);
      await refresh();
    } catch {
      if (!mounted.current) return;
      setStatus("error");
      setMessage("That did not save. Your answer is still on screen.");
    }
  }

  const total = tallies.reduce((n, t) => n + t.people, 0);
  const peak = tallies.reduce((n, t) => Math.max(n, t.people), 0);
  const unchecked = cards.filter((_, i) => !checked.includes(i));

  return (
    <NeuPanel radius="rounded-[26px]" className="mt-10 p-6 md:p-8">
      {/* ------------------------------------------------------------ clock */}
      <div className="flex flex-wrap items-center gap-4">
        <span
          data-timer
          className="font-display text-[2.2rem] font-semibold tabular-nums leading-none"
          style={{ color: remaining === 0 ? "var(--accent)" : "var(--text)" }}
        >
          {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
        </span>
        <button
          type="button"
          data-timer-toggle
          data-deck-keys="off"
          onClick={() => setRunning((r) => !r)}
          className="neu-raised rounded-full px-5 py-2 font-sans text-[12px] uppercase tracking-[0.16em]"
          style={{ color: "var(--text)" }}
        >
          {running ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          data-deck-keys="off"
          onClick={() => {
            setRunning(false);
            setRemaining(exercise.seconds);
          }}
          className="font-sans text-[12px] uppercase tracking-[0.16em] underline-offset-4 hover:underline"
          style={{ color: "var(--text-faint)" }}
        >
          Reset
        </button>
      </div>

      {/* ------------------------------------------------------------- input */}
      {exercise.mode === "count" ? (
        <div className="mt-7">
          <label
            htmlFor={`answer-${exercise.id}`}
            className="font-sans text-[12px] uppercase tracking-[0.16em]"
            style={{ color: "var(--text-faint)" }}
          >
            {exercise.question}
          </label>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              id={`answer-${exercise.id}`}
              data-deck-keys="off"
              inputMode="numeric"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className="neu-inset w-40 rounded-[16px] px-4 py-3 font-display text-[1.4rem] tabular-nums outline-none"
              style={{ color: "var(--text)", background: "transparent" }}
            />
            <span className="text-[0.95rem]" style={{ color: "var(--text-dim)" }}>
              {exercise.unit}
            </span>
          </div>
        </div>
      ) : (
        /* These rows are the only rendering of the list now, so they carry the
           body and the evidence link the cards used to. The link sits beside the
           toggle rather than inside it: an anchor nested in a button is invalid,
           and a click meant for the evidence would tick the box instead. */
        <ul className="mt-7 space-y-2">
          {cards.map((card, i) => {
            const on = checked.includes(i);
            return (
              <li key={card.title}>
                <div
                  className={`flex items-start gap-3 rounded-[16px] px-4 py-3 ${
                    on ? "neu-inset" : "neu-raised"
                  }`}
                >
                  <button
                    type="button"
                    data-deck-keys="off"
                    aria-pressed={on}
                    onClick={() =>
                      setChecked((c) => (on ? c.filter((n) => n !== i) : [...c, i]))
                    }
                    className="flex flex-1 items-start gap-3 text-left"
                    style={{ color: on ? "var(--text)" : "var(--text-dim)" }}
                  >
                    <span
                      aria-hidden
                      className="mt-[2px] font-sans text-[13px]"
                      style={{ color: on ? "var(--accent)" : "var(--text-faint)" }}
                    >
                      {on ? "✓" : "○"}
                    </span>
                    <span>
                      <span className="text-[0.95rem] font-semibold">{card.title}</span>
                      {card.body && (
                        <span
                          className="mt-1 block text-[0.88rem] leading-relaxed"
                          style={{ color: "var(--text-dim)" }}
                        >
                          {card.body}
                        </span>
                      )}
                    </span>
                  </button>
                  {card.href && (
                    <a
                      href={card.href}
                      target={card.href.startsWith("/") ? undefined : "_blank"}
                      rel={card.href.startsWith("/") ? undefined : "noreferrer noopener"}
                      data-deck-keys="off"
                      className="shrink-0 pt-[2px] font-sans text-[11px] uppercase tracking-[0.16em] underline-offset-4 hover:underline"
                      style={{
                        color: card.met === false ? "var(--text-faint)" : "var(--accent)",
                      }}
                    >
                      {card.met === false ? "Not yet" : "Evidence"} <span aria-hidden>↗</span>
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          data-submit
          data-deck-keys="off"
          onClick={() => void submit()}
          className="neu-raised rounded-full px-6 py-2.5 font-sans text-[12px] uppercase tracking-[0.16em]"
          style={{ color: "var(--accent)" }}
        >
          {status === "saving" ? "Saving" : mine === null ? "Submit" : "Update"}
        </button>
        {exercise.mode === "checklist" && (
          <span className="font-display text-[1.05rem]" style={{ color: "var(--text)" }}>
            {score} of {cards.length}
          </span>
        )}
        {/* Reserved height, like the poll and the spec box: a status line that
            appears on submit would move the section under a presenter. */}
        <span
          className="min-h-[1.2em] text-[0.9rem]"
          style={{ color: status === "error" ? "var(--accent)" : "var(--text-faint)" }}
        >
          {message ?? (status === "saved" ? "Saved. The room sees the number, not you." : "")}
        </span>
      </div>

      {/* --------------------------------------------------- what you keep */}
      {exercise.mode === "checklist" && mine !== null && unchecked.length > 0 && (
        <div className="mt-7 border-t pt-6" style={{ borderColor: "var(--edge)" }}>
          <p
            className="font-sans text-[12px] uppercase tracking-[0.16em]"
            style={{ color: "var(--text-faint)" }}
          >
            What you did not check. This is the homework.
          </p>
          <ul className="mt-3 space-y-1.5">
            {unchecked.map((card) => (
              <li key={card.title} className="text-[0.95rem]" style={{ color: "var(--text)" }}>
                {card.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ---------------------------------------------------------- the room */}
      {tallies.length > 0 && (
        <div className="mt-7 border-t pt-6" style={{ borderColor: "var(--edge)" }}>
          <p
            className="font-sans text-[12px] uppercase tracking-[0.16em]"
            style={{ color: "var(--text-faint)" }}
          >
            The room · {total} {total === 1 ? "answer" : "answers"}
          </p>
          <ul className="mt-4 space-y-2">
            {tallies.map((t) => (
              <li key={t.answer} className="flex items-center gap-3">
                <span
                  className="w-16 shrink-0 text-right font-display text-[0.95rem] tabular-nums"
                  style={{ color: t.answer === mine ? "var(--accent)" : "var(--text-dim)" }}
                >
                  {t.answer}
                </span>
                <span className="h-3 flex-1 overflow-hidden rounded-full neu-inset">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${peak ? (t.people / peak) * 100 : 0}%`,
                      background:
                        t.answer === mine ? "var(--accent)" : "var(--text-faint)",
                    }}
                  />
                </span>
                <span
                  className="w-10 shrink-0 font-sans text-[12px] tabular-nums"
                  style={{ color: "var(--text-faint)" }}
                >
                  {t.people}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </NeuPanel>
  );
}
