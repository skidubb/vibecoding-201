"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Exercise } from "@/content/sections";
import { backendConfigured, supabase } from "@/lib/supabase/client";
import { NeuPanel } from "@/components/neu/Neu";

type Status = "offline" | "loading" | "ready" | "saving" | "saved" | "error";

type Surfaced = { id: number; body: string };

/** How often the room's screen re-reads what the presenter has put up. */
const REFRESH_MS = 4000;

/**
 * The 120-second spec exercise.
 *
 * Three things happen here and they are deliberately separate, because the
 * separation is the lesson. Writing is local and works with no backend at all.
 * *Submitting* stores a row the author owns. *Sharing* is a second, explicit
 * act by that author — it sets `shared_at`, which is the only thing that lets
 * the presenter see the work at all, and a check constraint in Postgres refuses
 * to put anything on screen that has not been shared first. An attendee who
 * writes something they would rather not read out keeps it, permanently, and
 * that is enforced a layer below anything this component does.
 *
 * The timer is intentionally local and unsynchronised. Syncing it would add a
 * live dependency to the one part of the exercise that has to work on a laptop
 * with no network, and buy nothing: everyone is looking at the same projected
 * screen.
 */
export function ExerciseWidget({
  exercise,
  sectionId,
}: {
  exercise: Exercise;
  sectionId: string;
}) {
  const [remaining, setRemaining] = useState(exercise.seconds);
  const [running, setRunning] = useState(false);

  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>(
    backendConfigured ? "loading" : "offline",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [rowId, setRowId] = useState<number | null>(null);
  const [shared, setShared] = useState(false);
  const [surfaced, setSurfaced] = useState<Surfaced[]>([]);

  const root = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  useEffect(() => () => void (mounted.current = false), []);

  // ------------------------------------------------------------------ timer
  useEffect(() => {
    if (!running || remaining <= 0) return;
    const t = window.setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [running, remaining]);

  useEffect(() => {
    if (remaining === 0) setRunning(false);
  }, [remaining]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  // ------------------------------------------------------ what is on screen
  const readSurfaced = useCallback(async () => {
    const client = supabase();
    if (!client) return;
    const { data } = await client
      .from("submissions")
      .select("id, body")
      .eq("exercise_id", exercise.id)
      .not("surfaced_at", "is", null)
      .order("surfaced_at", { ascending: true });
    if (mounted.current) setSurfaced((data as Surfaced[] | null) ?? []);
  }, [exercise.id]);

  // Own row first, then poll for whatever the presenter has surfaced.
  //
  // Polled rather than subscribed: `submissions` is not in the realtime
  // publication, and adding it is a schema change this phase does not need.
  // Four seconds is invisible next to the presenter walking to the next slide,
  // and it only runs while the section is actually on screen — a hundred
  // browsers left open on a laptop overnight should not be querying anything.
  useEffect(() => {
    const client = supabase();
    if (!client) return;

    let cancelled = false;

    (async () => {
      try {
        const { data: session } = await client.auth.getSession();
        if (session.session) {
          const { data: mine } = await client
            .from("submissions")
            .select("id, body, shared_at")
            .eq("exercise_id", exercise.id)
            .eq("user_id", session.session.user.id)
            .maybeSingle();
          if (!cancelled && mine) {
            setRowId(mine.id as number);
            setText(mine.body as string);
            setShared(mine.shared_at !== null);
            setStatus("saved");
          }
        }
        await readSurfaced();
        if (!cancelled) setStatus((s) => (s === "loading" ? "ready" : s));
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Saving is unavailable. Write it anyway — keep your copy.");
        }
      }
    })();

    let timer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      if (entry.isIntersecting) {
        void readSurfaced();
        timer = window.setInterval(() => void readSurfaced(), REFRESH_MS);
      }
    });
    if (root.current) observer.observe(root.current);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      observer.disconnect();
    };
  }, [exercise.id, readSurfaced]);

  // ----------------------------------------------------------------- submit
  async function submit() {
    // Malformed input is refused here and never sent. `body` is NOT NULL in
    // Postgres but an empty string satisfies that, so a blank spec would store
    // a row the presenter later reads out as silence.
    const body = text.trim();
    if (body.length < 12) {
      setMessage("Write at least the three lines before submitting.");
      return;
    }

    // Not a disabled button. The suite runs with the backend switched off and
    // the class argues all hour that a control which fails silently is worse
    // than one that fails in words — a greyed-out Submit with no explanation is
    // exactly the failure being argued against, and it would also put this
    // refusal beyond the reach of the test that guards it.
    const client = supabase();
    if (!client) {
      setMessage("Submissions are offline. Nothing was sent — keep your copy.");
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

      // Upsert, not insert. `unique (exercise_id, user_id)` means a second
      // submission from the same person is an edit of their first, not a
      // duplicate row and not an error they have to understand mid-exercise.
      const { data, error } = await client
        .from("submissions")
        .upsert(
          { exercise_id: exercise.id, user_id: userId, body },
          { onConflict: "exercise_id,user_id" },
        )
        .select("id, shared_at")
        .single();
      if (error) throw error;

      if (!mounted.current) return;
      setRowId(data.id as number);
      setShared(data.shared_at !== null);
      setStatus("saved");
      setMessage("Saved. Only you can see it.");
    } catch {
      if (!mounted.current) return;
      setStatus("error");
      setMessage("That did not save. Nothing was stored — keep your copy.");
    }
  }

  /** The author's own consent, and the only route onto the screen. */
  async function setShare(next: boolean) {
    const client = supabase();
    if (!client || rowId === null) return;

    setStatus("saving");
    // Withdrawing consent takes it down as well as un-offers it. The check
    // constraint would reject `shared_at = null` while `surfaced_at` is set,
    // and a presenter left holding a slide the author just retracted is the
    // wrong way to lose that argument.
    const patch = next
      ? { shared_at: new Date().toISOString() }
      : { shared_at: null, surfaced_at: null };

    const { error } = await client.from("submissions").update(patch).eq("id", rowId);
    if (!mounted.current) return;

    if (error) {
      setStatus("error");
      setMessage("That did not go through. Your work is still saved.");
      return;
    }
    setShared(next);
    setStatus("saved");
    setMessage(
      next
        ? "Shared. Scott can read it now, and can put it on screen."
        : "Withdrawn. It is private again, and off the screen.",
    );
    void readSurfaced();
  }

  const busy = status === "saving";
  const offline = status === "offline";

  // Whether the presenter has this author's own row on screen right now.
  //
  // While it is up, the database refuses any edit to it — an author's update
  // must leave `surfaced_at` null, which is what stops an attendee putting
  // their own text on the projected screen. Saying so is better than letting
  // Save fail with a generic error while a hundred people watch. Taking it
  // down is still allowed, and is the way back to editing.
  const onScreen = rowId !== null && surfaced.some((row) => row.id === rowId);

  return (
    <div ref={root} data-deck-keys="off" className="mt-10">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        {/* ------------------------------------------------------- the clock */}
        <NeuPanel radius="rounded-[24px]" className="flex flex-col justify-between p-6">
          <p
            className="font-sans text-[11px] font-medium uppercase tracking-[0.2em]"
            style={{ color: "var(--text-faint)" }}
          >
            Time remaining
          </p>
          {/* The clock takes the slack. `justify-between` alone left a band of
              dead panel under it — this column is as tall as the writing box
              beside it, which is much taller than a label, a number and two
              buttons. */}
          <p
            data-timer
            aria-live="off"
            className="flex flex-1 items-center py-6 font-display text-[clamp(2.6rem,6vw,3.6rem)] font-semibold tabular-nums leading-none"
            style={{
              color: remaining <= 15 ? "var(--accent)" : "var(--text)",
            }}
          >
            {minutes}:{String(seconds).padStart(2, "0")}
          </p>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              data-timer-toggle
              onClick={() => {
                if (remaining === 0) setRemaining(exercise.seconds);
                setRunning((r) => !r);
              }}
              className="neu-raised neu-edge rounded-full px-5 py-2 font-sans text-[12px] font-medium uppercase tracking-[0.14em]"
              style={{ color: "var(--text)" }}
            >
              {running ? "Pause" : remaining === exercise.seconds ? "Start" : "Resume"}
            </button>
            <button
              type="button"
              onClick={() => {
                setRunning(false);
                setRemaining(exercise.seconds);
              }}
              className="rounded-full px-4 py-2 font-sans text-[12px] font-medium uppercase tracking-[0.14em]"
              style={{ color: "var(--text-faint)" }}
            >
              Reset
            </button>
          </div>
        </NeuPanel>

        {/* ------------------------------------------------------ the writing */}
        <NeuPanel radius="rounded-[24px]" className="p-6">
          <label
            htmlFor={`${sectionId}-body`}
            className="font-sans text-[11px] font-medium uppercase tracking-[0.2em]"
            style={{ color: "var(--text-faint)" }}
          >
            Your spec
          </label>
          <textarea
            id={`${sectionId}-body`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            spellCheck={false}
            placeholder={exercise.placeholder}
            className="neu-inset neu-edge mt-3 w-full resize-none rounded-2xl px-4 py-3 text-[0.95rem] leading-relaxed outline-none"
            style={{ background: "transparent", color: "var(--text)" }}
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-submit
              disabled={busy || onScreen}
              onClick={() => void submit()}
              className="neu-raised neu-edge rounded-full px-6 py-2.5 font-sans text-[12px] font-medium uppercase tracking-[0.14em] disabled:opacity-40"
              style={{ color: "var(--text)" }}
            >
              {status === "saved" ? "Save changes" : "Submit"}
            </button>

            {rowId !== null && (
              <button
                type="button"
                data-share
                disabled={busy}
                onClick={() => void setShare(!shared)}
                className="rounded-full px-5 py-2.5 font-sans text-[12px] font-medium uppercase tracking-[0.14em] disabled:opacity-40"
                style={{ color: shared ? "var(--accent)" : "var(--text-dim)" }}
              >
                {shared ? "Withdraw from the room" : "Share with the room"}
              </button>
            )}
          </div>

          {/* Fixed height. This line changes on every action, and a section
              that grows and shrinks under the presenter's feet moves the stop
              they are standing on.

              `message` wins over every resting state, including offline.
              Ordering these the other way round meant a backend-off site
              answered a blank submission with the standing offline notice and
              threw away the sentence saying what was actually wrong — the
              press looked ignored. */}
          <p
            aria-live="polite"
            className="mt-3 min-h-[2.5rem] text-[0.9rem] leading-snug"
            style={{ color: status === "error" ? "var(--accent)" : "var(--text-dim)" }}
          >
            {onScreen
              ? "This is on the screen now. Take it down to edit it."
              : (message ??
                (offline
                  ? "Submissions are offline. The timer still runs — write it in your own notes."
                  : status === "loading"
                    ? "…"
                    : "Nobody sees this until you share it. Sharing is a separate press."))}
          </p>
        </NeuPanel>
      </div>

      {/* ------------------------------------------------ what is on screen */}
      {surfaced.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {surfaced.map((row) => (
            <NeuPanel key={row.id} variant="inset" radius="rounded-2xl" className="px-6 py-5">
              <p
                className="font-sans text-[11px] font-medium uppercase tracking-[0.2em]"
                style={{ color: "var(--accent)" }}
              >
                On screen · shared by its author
              </p>
              <p
                className="mt-3 whitespace-pre-wrap text-[0.98rem] leading-relaxed"
                style={{ color: "var(--text)" }}
              >
                {row.body}
              </p>
            </NeuPanel>
          ))}
        </div>
      )}
    </div>
  );
}
