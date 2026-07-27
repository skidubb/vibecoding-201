"use client";

import { useCallback, useEffect, useState } from "react";
import { sections } from "@/content/sections";
import { useDeck } from "@/lib/deck-context";
import { supabase } from "@/lib/supabase/client";

type PollState = "closed" | "open" | "revealed";

type Integrity = {
  total_votes: number;
  distinct_accounts: number;
  new_accounts_60s: number;
};

/**
 * The presenter's controls, visible only to an admin.
 *
 * Admin is asked of the database, never inferred in the browser: `is_admin()`
 * is a definer function over a table with row-level security on and no
 * policies, so a client that lies about it still cannot update a poll.
 *
 * Keys are all Shift-modified. Bare letters would collide with the deck's own
 * navigation, and the guard that lets a focused control keep Space would make
 * a bare reveal key stop working the moment Scott clicked Open.
 */
export function PresenterBar() {
  const { activeIndex } = useDeck();
  const [isAdmin, setIsAdmin] = useState(false);
  const [state, setState] = useState<PollState | null>(null);
  const [counts, setCounts] = useState<Integrity | null>(null);
  const [busy, setBusy] = useState(false);

  const slug = sections[activeIndex]?.poll?.slug ?? null;

  useEffect(() => {
    const client = supabase();
    if (!client) return;
    let cancelled = false;
    void client.rpc("is_admin").then((result: { data: unknown }) => {
      if (!cancelled) setIsAdmin(result.data === true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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

  useEffect(() => {
    if (!isAdmin || !slug) return;
    const onKey = (e: KeyboardEvent) => {
      if (!e.shiftKey) return;
      const key = e.key.toLowerCase();
      if (key === "o") void set("open");
      else if (key === "c") void set("closed");
      else if (key === "r") void set("revealed");
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAdmin, slug, set]);

  if (!isAdmin || !slug) return null;

  const Btn = ({ label, to }: { label: string; to: PollState }) => (
    <button
      type="button"
      disabled={busy || state === to}
      onClick={() => void set(to)}
      className="rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] disabled:opacity-40"
      style={{ color: state === to ? "var(--accent)" : "var(--text-dim)" }}
    >
      {label}
    </button>
  );

  return (
    <div
      data-deck-keys="off"
      className="neu-raised neu-edge fixed bottom-6 right-6 z-50 flex items-center gap-1 rounded-full px-3 py-2"
    >
      <span
        className="px-2 font-sans text-[11px] uppercase tracking-[0.16em]"
        style={{ color: "var(--text-faint)" }}
      >
        {slug} · {state ?? "…"}
        {counts
          ? ` · ${counts.total_votes} from ${counts.distinct_accounts}${
              counts.new_accounts_60s > counts.distinct_accounts / 2 &&
              counts.distinct_accounts > 4
                ? " ⚠"
                : ""
            }`
          : ""}
      </span>
      <Btn label="Open" to="open" />
      <Btn label="Close" to="closed" />
      <Btn label="Reveal" to="revealed" />
    </div>
  );
}
