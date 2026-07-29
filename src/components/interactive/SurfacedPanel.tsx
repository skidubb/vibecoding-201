"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { NeuPanel } from "@/components/neu/Neu";

export type SurfacedRow = { id: number; body: string };

/** How often the room's screen re-reads what the presenter has put up. */
export const REFRESH_MS = 4000;

/**
 * What the presenter has put on screen, for one exercise.
 *
 * Extracted so the exercise slide and the standalone review slide read through
 * the same query. Two copies of the query that decides what a hundred people see
 * is how the two drift, and the one that drifts is whichever is not being looked
 * at during rehearsal.
 *
 * Polled rather than subscribed: `submissions` is not in the realtime
 * publication, and adding it is a schema change this does not need. Four seconds
 * is invisible next to the presenter walking to the next slide, and it only runs
 * while the section is actually on screen — a hundred browsers left open on a
 * laptop overnight should not be querying anything.
 */
export function useSurfaced(exerciseId: string, root: React.RefObject<HTMLElement | null>) {
  const [rows, setRows] = useState<SurfacedRow[]>([]);
  const mounted = useRef(true);
  useEffect(() => () => void (mounted.current = false), []);

  const read = useCallback(async () => {
    const client = supabase();
    if (!client) return;
    const { data } = await client
      .from("submissions")
      .select("id, body")
      .eq("exercise_id", exerciseId)
      .not("surfaced_at", "is", null)
      .order("surfaced_at", { ascending: true });
    if (mounted.current) setRows((data as SurfacedRow[] | null) ?? []);
  }, [exerciseId]);

  useEffect(() => {
    const client = supabase();
    if (!client) return;

    let timer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      if (entry.isIntersecting) {
        void read();
        timer = window.setInterval(() => void read(), REFRESH_MS);
      }
    });
    if (root.current) observer.observe(root.current);

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
    };
  }, [read, root]);

  return { rows, read };
}

/** The grid of surfaced work. Renders nothing when there is nothing up. */
export function SurfacedGrid({ rows }: { rows: SurfacedRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {rows.map((row) => (
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
  );
}

/**
 * The standalone review slide: the room's own specs, and nothing that writes.
 *
 * No textarea, no Submit, no Share, and above all no put-it-on-screen control.
 * Surfacing stays in the presenter bar — a write control on this slide would put
 * the `authors_cannot_surface` guarantee back into the UI's hands, and that
 * guarantee is the one the class spends an hour arguing belongs in the database.
 *
 * The read is granted `to authenticated`, and an attendee who never submitted has
 * no session — so it signs in anonymously first. On the exercise slide that was
 * masked, because everyone there had just minted a session by submitting; on a
 * standalone slide it would have been "the room sees a blank panel while the
 * projector shows the work". Widening the policy to `anon` would have fixed it
 * too, and that grant is worth keeping narrow.
 */
export function SurfacedPanel({
  exerciseId,
  empty,
}: {
  exerciseId: string;
  empty?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const { rows, read } = useSurfaced(exerciseId, root);

  useEffect(() => {
    const client = supabase();
    if (!client) return;
    let cancelled = false;
    (async () => {
      const { data: session } = await client.auth.getSession();
      if (!session.session) await client.auth.signInAnonymously();
      if (!cancelled) await read();
    })();
    return () => {
      cancelled = true;
    };
  }, [read]);

  return (
    // Reserved height. Surfacing the first spec mid-class must not shift the
    // section the presenter is standing on.
    <div ref={root} data-deck-keys="off" className="mt-10 min-h-[18rem]">
      {rows.length > 0 ? (
        <SurfacedGrid rows={rows} />
      ) : (
        <NeuPanel variant="inset" radius="rounded-2xl" className="px-6 py-8">
          <p className="text-[0.98rem] leading-relaxed" style={{ color: "var(--text-dim)" }}>
            {empty ?? "Nothing on screen yet."}
          </p>
        </NeuPanel>
      )}
    </div>
  );
}
