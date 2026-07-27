"use client";

import { useEffect, useState } from "react";
import { backendConfigured, supabase } from "@/lib/supabase/client";

type Row = { name: string; section_id: string | null; created_at: string };

/**
 * The site's own log, on the slide that argues every tool needs one.
 *
 * It reads through `recent_events()`, a definer function that returns what
 * happened and never who did it. The `events` table itself is not readable —
 * a column grant withholds `user_id` even from an admin's direct select — so
 * this can sit on a public page while the room is using it, which is the only
 * reason it is worth showing at all. A log nobody can look at proves nothing.
 */
export function EventFeed({ limit = 8 }: { limit?: number }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const client = supabase();
    if (!client) return;
    let cancelled = false;

    const read = async () => {
      const { data, error } = await client.rpc("recent_events", { p_limit: limit });
      if (cancelled) return;
      if (error) setFailed(true);
      else setRows((data as Row[]) ?? []);
    };

    void read();
    const timer = window.setInterval(read, 6000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [limit]);

  if (!backendConfigured) {
    return (
      <p className="mt-8 text-[0.92rem]" style={{ color: "var(--text-dim)" }}>
        The log is offline with the rest of the backend. It is the one panel on
        this page that cannot be faked while it is.
      </p>
    );
  }

  if (failed) {
    return (
      <p className="mt-8 text-[0.92rem]" style={{ color: "var(--accent)" }}>
        The log is unreachable. Saying so is the point of having one.
      </p>
    );
  }

  return (
    <div className="mt-8" data-deck-keys="off">
      <p
        className="font-sans text-[11px] uppercase tracking-[0.18em]"
        style={{ color: "var(--text-faint)" }}
      >
        This page, in the last few minutes
      </p>

      {/* Fixed height so arriving rows cannot change the section's height and
          invalidate the measured presenter stop grid mid-class. */}
      <ul
        aria-live="polite"
        className="mt-4 h-[13.5rem] overflow-hidden font-mono text-[0.82rem]"
        style={{ color: "var(--text-dim)" }}
      >
        {rows === null ? (
          <li>reading…</li>
        ) : rows.length === 0 ? (
          <li>
            nothing yet — copy a prompt or vote in a poll and it appears here
          </li>
        ) : (
          rows.map((row, i) => (
            <li key={`${row.created_at}-${i}`} className="truncate py-[3px]">
              <span style={{ color: "var(--accent)" }}>{row.name}</span>
              {row.section_id ? ` · ${row.section_id}` : ""}
              <span style={{ color: "var(--text-faint)" }}>
                {" · "}
                {new Date(row.created_at).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
