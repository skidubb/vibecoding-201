"use client";

import { useCallback, useEffect, useState } from "react";
import { sections } from "@/content/sections";
import { useDeck } from "@/lib/deck-context";
import { backendConfigured, supabase } from "@/lib/supabase/client";
import { useIsAdmin } from "@/lib/use-is-admin";

/**
 * The chrome floats over full-bleed photography on both themes, so it cannot
 * borrow the section's neumorphic palette: dark-on-dark made the first version
 * of this bar literally invisible in a 1080p screenshot. Fixed brand colors,
 * not theme vars — a control the presenter has to find mid-class does not get
 * to be subtle.
 */
const CHROME_BG = "rgba(10, 12, 24, 0.92)";
const CHROME_EDGE = "1px solid rgba(223, 40, 91, 0.7)";
const CHROME_TEXT = "rgba(234, 236, 248, 0.92)";
const CHROME_TEXT_DIM = "rgba(234, 236, 248, 0.58)";
const CHROME_ACCENT = "#FF5C8A";

type PollState = "closed" | "open" | "revealed";

type Integrity = {
  total_votes: number;
  distinct_accounts: number;
  new_accounts_60s: number;
};

type Shared = { id: number; body: string; surfaced_at: string | null };

/** How often the bar re-reads what the room has shared. */
const REFRESH_MS = 4000;

/**
 * The presenter's controls, visible only to an admin.
 *
 * Admin is asked of the database, never inferred in the browser: `is_admin()`
 * is a definer function over a table with row-level security on and no
 * policies, so a client that lies about it still cannot update a poll — or read
 * a submission whose author has not shared it.
 *
 * Keys are all Shift-modified. Bare letters would collide with the deck's own
 * navigation, and the guard that lets a focused control keep Space would make
 * a bare reveal key stop working the moment Scott clicked Open.
 */
export function PresenterBar() {
  const { activeIndex } = useDeck();
  const isAdmin = useIsAdmin();
  const [state, setState] = useState<PollState | null>(null);
  const [counts, setCounts] = useState<Integrity | null>(null);
  const [tally, setTally] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);

  const [shared, setShared] = useState<Shared[]>([]);
  const [open, setOpen] = useState(false);

  const section = sections[activeIndex];
  const slug = section?.poll?.slug ?? null;
  const exerciseId = section?.exercise?.id ?? null;

  // ------------------------------------------------------------------ polls
  const read = useCallback(async () => {
    const client = supabase();
    if (!client || !slug) return;

    const { data: poll } = await client
      .from("polls")
      .select("state")
      .eq("slug", slug)
      .maybeSingle();
    setState((poll?.state as PollState) ?? null);

    // Totals against distinct accounts. One vote per account is enforced by a
    // primary key, but accounts are free while anonymous sign-in is on, so the
    // safeguard is being able to see it happen. Narrating a stuffed poll is a
    // better lesson than pretending it cannot be done.
    const { data: integrity } = await client.rpc("poll_integrity", {
      p_poll_slug: slug,
    });
    setCounts((integrity as Integrity[] | null)?.[0] ?? null);

    // Per-option counts. poll_tallies is the same public aggregate every
    // voter's bars are drawn from — the presenter just gets it as numbers.
    const { data: tallies } = await client
      .from("poll_tallies")
      .select("option_id, votes")
      .eq("poll_slug", slug);
    setTally(
      Object.fromEntries(
        ((tallies as { option_id: string; votes: number }[] | null) ?? []).map((t) => [
          t.option_id,
          t.votes,
        ]),
      ),
    );
  }, [slug]);

  useEffect(() => {
    if (!isAdmin || !slug) return;
    void read();
    const client = supabase();
    if (!client) return;
    const channel = client
      .channel(`presenter:${slug}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "poll_tallies", filter: `poll_slug=eq.${slug}` },
        () => void read(),
      )
      .subscribe();
    return () => void client.removeChannel(channel);
  }, [isAdmin, slug, read]);

  const set = useCallback(
    async (next: PollState) => {
      const client = supabase();
      if (!client || !slug) return;
      setBusy(true);
      // No optimistic update. On stage, a control that shows "open" when the
      // write was rejected is worse than one that takes a beat to answer.
      const { error } = await client.from("polls").update({ state: next }).eq("slug", slug);
      if (!error) await read();
      setBusy(false);
    },
    [slug, read],
  );

  // ------------------------------------------------------------ submissions
  //
  // Only what the room offered. The filter is a courtesy, not the control:
  // `admins read what authors shared` means an unshared submission does not
  // exist as far as this query is concerned, and removing the filter would
  // change nothing about what comes back.
  const readShared = useCallback(async () => {
    const client = supabase();
    if (!client || !exerciseId) return;
    const { data } = await client
      .from("submissions")
      .select("id, body, surfaced_at")
      .eq("exercise_id", exerciseId)
      .not("shared_at", "is", null)
      .order("id", { ascending: true });
    setShared((data as Shared[] | null) ?? []);
  }, [exerciseId]);

  useEffect(() => {
    if (!isAdmin || !exerciseId) {
      setOpen(false);
      return;
    }
    void readShared();
    const timer = window.setInterval(() => void readShared(), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [isAdmin, exerciseId, readShared]);

  const surface = useCallback(
    async (row: Shared) => {
      const client = supabase();
      if (!client) return;
      setBusy(true);
      await client
        .from("submissions")
        .update({ surfaced_at: row.surfaced_at ? null : new Date().toISOString() })
        .eq("id", row.id);
      await readShared();
      setBusy(false);
    },
    [readShared],
  );

  // ------------------------------------------------------------------- keys
  useEffect(() => {
    if (!isAdmin) return;
    const onKey = (e: KeyboardEvent) => {
      if (!e.shiftKey) return;
      const key = e.key.toLowerCase();
      if (slug && key === "o") void set("open");
      else if (slug && key === "c") void set("closed");
      else if (slug && key === "r") void set("revealed");
      else if (exerciseId && key === "s") setOpen((o) => !o);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAdmin, slug, exerciseId, set]);

  // Signed out (or signed in without the role), the same corner carries the
  // way in. A deck whose only login is a URL you have to know is a deck whose
  // owner cannot find the login — this link is the answer to "where is the
  // sign-in", permanently. It goes to /signin, not /admin, so a curious
  // attendee lands on the page that already explains they do not need it.
  if (!isAdmin) {
    if (!backendConfigured) return null; // kill-switch deck carries no doors
    return (
      <a
        href="/signin"
        data-signin-door
        data-deck-keys="off"
        className="fixed bottom-6 right-6 z-50 rounded-full px-5 py-2.5 font-sans text-[12px] font-semibold uppercase tracking-[0.16em]"
        style={{ background: CHROME_BG, border: CHROME_EDGE, color: CHROME_ACCENT }}
      >
        Sign in
      </a>
    );
  }
  // For an admin the bar renders on every section — the chip is the standing
  // proof of being signed in, and the door to the console. Controls still
  // appear only where there is live state to control.

  const Btn = ({ label, to }: { label: string; to: PollState }) => (
    <button
      type="button"
      disabled={busy || state === to}
      onClick={() => void set(to)}
      className="rounded-full px-3 py-1.5 text-[12px] font-medium uppercase tracking-[0.14em] disabled:opacity-40"
      style={{ color: state === to ? CHROME_ACCENT : CHROME_TEXT_DIM }}
    >
      {label}
    </button>
  );

  return (
    <div data-deck-keys="off" className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* The panel sits above the bar so opening it never moves the controls
          out from under the cursor mid-class. */}
      {open && exerciseId && (
        <div className="neu-raised neu-edge max-h-[60vh] w-[min(30rem,calc(100vw-3rem))] overflow-y-auto rounded-3xl p-5">
          <p
            className="font-sans text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--text-faint)" }}
          >
            Shared with you · {shared.length}
          </p>

          {shared.length === 0 ? (
            <p className="mt-3 text-[0.9rem]" style={{ color: "var(--text-dim)" }}>
              Nothing yet. Submissions appear here only once their author shares
              them — what the room has written but kept private is not readable
              from this account.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
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
        </div>
      )}

      <div
        className="flex items-center gap-1 rounded-full px-3 py-2"
        style={{ background: CHROME_BG, border: CHROME_EDGE }}
      >
        <a
          href="/admin"
          data-presenter-chip
          data-deck-keys="off"
          className="rounded-full px-2 font-sans text-[12px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: CHROME_ACCENT }}
        >
          Presenter
        </a>

        {(slug || exerciseId) && (
          <span
            className="px-2 font-sans text-[12px] uppercase tracking-[0.16em]"
            style={{ color: CHROME_TEXT }}
          >
            {slug ?? exerciseId} · {slug ? (state ?? "…") : "exercise"}
            {slug && counts
              ? ` · ${counts.total_votes} from ${counts.distinct_accounts}${
                  counts.new_accounts_60s > counts.distinct_accounts / 2 &&
                  counts.distinct_accounts > 4
                    ? " ⚠"
                    : ""
                }`
              : ""}
            {slug && section?.poll
              ? ` · ${section.poll.options
                  .map((o) => `${o.label} ${tally[o.id] ?? 0}`)
                  .join(" · ")}`
              : ""}
          </span>
        )}

        {slug && (
          <>
            <Btn label="Open" to="open" />
            <Btn label="Close" to="closed" />
            <Btn label="Reveal" to="revealed" />
          </>
        )}

        {(slug || exerciseId) && (
          <button
            type="button"
            data-refresh
            disabled={busy}
            onClick={() => {
              void read();
              void readShared();
            }}
            className="rounded-full px-3 py-1.5 text-[12px] font-medium uppercase tracking-[0.14em] disabled:opacity-40"
            style={{ color: CHROME_TEXT_DIM }}
          >
            Refresh
          </button>
        )}

        {exerciseId && (
          <button
            type="button"
            data-submissions
            onClick={() => setOpen((o) => !o)}
            className="rounded-full px-3 py-1.5 text-[12px] font-medium uppercase tracking-[0.14em]"
            style={{ color: open ? CHROME_ACCENT : CHROME_TEXT_DIM }}
          >
            Shared {shared.length}
          </button>
        )}
      </div>
    </div>
  );
}
