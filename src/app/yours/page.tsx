"use client";

import { useCallback, useEffect, useState } from "react";
import { sections } from "@/content/sections";
import { backendConfigured, supabase } from "@/lib/supabase/client";
import { NeuBadge, NeuPanel } from "@/components/neu/Neu";

/**
 * What one attendee did, for that attendee.
 *
 * Deliberately not part of `/report`. That page is public and unauthenticated
 * and can be, because it reads only aggregates: a tally is not a vote, and the
 * room shared its work with a room rather than with the internet. This page is
 * the opposite shape. It reads submissions, so it reads nothing without a
 * session and nothing belonging to anyone else, and RLS is what enforces that
 * rather than the query below.
 *
 * The room's distribution appears here too, from `answer_tallies`, which is
 * public by design. Seeing where you fell needs the aggregate as well as your
 * own number, and the aggregate names nobody.
 */

const JOBS = sections.find((s) => s.jobs)?.jobs ?? [];

type Row = { exercise_id: string; body: string; answer: number | null };
type Tally = { exercise_id: string; answer: number; people: number };

export default function YoursPage() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [job, setJob] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [tallies, setTallies] = useState<Tally[]>([]);

  const read = useCallback(async () => {
    const client = supabase();
    if (!client) return setSignedIn(false);

    const { data: session } = await client.auth.getSession();
    if (!session.session) return setSignedIn(false);
    setSignedIn(true);

    const [{ data: profile }, { data: mine }, { data: all }] = await Promise.all([
      client.from("profiles").select("job").eq("id", session.session.user.id).maybeSingle(),
      client.from("submissions").select("exercise_id, body, answer"),
      client.from("answer_tallies").select("exercise_id, answer, people"),
    ]);

    setJob((profile?.job as string | null) ?? null);
    setRows((mine as Row[] | null) ?? []);
    setTallies((all as Tally[] | null) ?? []);
  }, []);

  useEffect(() => {
    void read();
  }, [read]);

  const chosen = JOBS.find((j) => j.id === job);
  const row = (id: string) => rows.find((r) => r.exercise_id === id);
  const spec = row("spec");
  const done = row("done-count");
  const invented = row("invented-count");
  const score = row("score");

  /** How many people landed on the same number, and how many did not. */
  function company(exerciseId: string, answer: number | null) {
    if (answer === null) return null;
    const forExercise = tallies.filter((t) => t.exercise_id === exerciseId);
    const total = forExercise.reduce((n, t) => n + t.people, 0);
    const same = forExercise.find((t) => t.answer === answer)?.people ?? 0;
    if (total < 2) return null;
    return { same, total };
  }

  return (
    <main
      data-theme="dark"
      className="min-h-screen px-5 py-14"
      style={{ background: "var(--surface)", color: "var(--text)" }}
    >
      <div className="mx-auto w-full max-w-3xl">
        <NeuBadge accent>Vibecoding 201 · your work</NeuBadge>

        <h1 className="mt-6 font-display text-[clamp(1.8rem,5vw,2.6rem)] font-semibold leading-tight">
          Your job, your numbers, and what is left.
        </h1>

        {signedIn === false && (
          <p className="mt-6 leading-relaxed" style={{ color: "var(--text-dim)" }}>
            {backendConfigured
              ? "This page reads your own submissions, so it needs the account you used in class. Sign in from the deck and come back."
              : "Accounts are offline, so there is nothing to read. Your work is wherever you wrote it."}
          </p>
        )}

        {signedIn && (
          <div className="mt-10 space-y-4">
            <NeuPanel radius="rounded-[22px]" className="px-6 py-5">
              <h2 className="font-sans text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--text-faint)" }}>
                The job you took
              </h2>
              <p className="mt-2 text-[0.98rem] leading-relaxed">
                {chosen ? chosen.job : "You did not pick one. Six are in the kit."}
              </p>
              {chosen && (
                <p className="mt-2 text-[0.92rem]" style={{ color: "var(--text-dim)" }}>
                  {chosen.user}
                </p>
              )}
            </NeuPanel>

            <NeuPanel radius="rounded-[22px]" className="px-6 py-5">
              <h2 className="font-sans text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--text-faint)" }}>
                The Done you wrote
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-[0.98rem] leading-relaxed">
                {spec?.body ?? "Nothing saved. The three lines are still the exercise."}
              </p>
            </NeuPanel>

            {[
              { label: "Rows your Done returned", row: done, id: "done-count" },
              { label: "Things your plan invented", row: invented, id: "invented-count" },
            ].map((item) => {
              const c = company(item.id, item.row?.answer ?? null);
              return (
                <NeuPanel key={item.id} radius="rounded-[22px]" className="px-6 py-5">
                  <h2 className="font-sans text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--text-faint)" }}>
                    {item.label}
                  </h2>
                  <p className="mt-2 font-display text-[1.6rem] font-semibold tabular-nums">
                    {item.row?.answer ?? "not submitted"}
                  </p>
                  {c && (
                    <p className="mt-1 text-[0.9rem]" style={{ color: "var(--text-dim)" }}>
                      {c.same} of {c.total} in the room gave the same number.
                    </p>
                  )}
                </NeuPanel>
              );
            })}

            <NeuPanel radius="rounded-[22px]" className="px-6 py-5">
              <h2 className="font-sans text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--text-faint)" }}>
                What you did not check. This is the homework.
              </h2>
              {score?.answer === undefined || score === undefined ? (
                <p className="mt-2 text-[0.98rem]" style={{ color: "var(--text-dim)" }}>
                  You did not score anything against the nine.
                </p>
              ) : (
                <>
                  <p className="mt-2 font-display text-[1.6rem] font-semibold tabular-nums">
                    {score.answer} of 9
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-[0.98rem] leading-relaxed">
                    {score.body}
                  </p>
                </>
              )}
            </NeuPanel>
          </div>
        )}

        <div className="mt-12 flex gap-6">
          <a href="/" className="text-[0.9rem] underline underline-offset-4" style={{ color: "var(--text-faint)" }}>
            Open the full deck
          </a>
          <a href="/kit" className="text-[0.9rem] underline underline-offset-4" style={{ color: "var(--text-faint)" }}>
            The kit
          </a>
          <a href="/report" className="text-[0.9rem] underline underline-offset-4" style={{ color: "var(--text-faint)" }}>
            What the room answered
          </a>
        </div>
      </div>
    </main>
  );
}
