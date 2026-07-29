"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { NeuPanel } from "@/components/neu/Neu";

export type SurfacedRow = { id: number; body: string };

/** How often the room's screen re-reads what the presenter has put up. */
export const REFRESH_MS = 4000;

/**
 * Reads the submissions the presenter has put on screen for one exercise.
 *
 * Shared by the exercise slide and the standalone review slide so both use the
 * same query. Keeping two copies would let them diverge, and the divergence would
 * only appear in whichever slide was not being rehearsed.
 *
 * Polled rather than subscribed, because `submissions` is not in the realtime
 * publication and adding it is a schema change this does not require. The four
 * second interval is short relative to how long a presenter spends on a slide, and
 * it runs only while the section is on screen so that idle tabs issue no queries.
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
 * The review slide: the specs shared with the room, read-only.
 *
 * Renders no textarea, no Submit, no Share and no control that sets `surfaced_at`.
 * Surfacing happens in the presenter bar. Putting a write control here would move
 * the `authors_cannot_surface` guarantee from the database into the interface.
 *
 * The select policy is granted `to authenticated`, and an attendee who never
 * submitted has no session, so this signs in anonymously before reading. The
 * problem did not appear on the exercise slide because everyone there had a session
 * from submitting. Widening the policy to `anon` would also fix it, but that grant
 * is worth keeping narrow.
 */export function SurfacedPanel({
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
    // Reserved height, so putting up the first spec does not change the height of
    // the section the presenter is currently on.
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
