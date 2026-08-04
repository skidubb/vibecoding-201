"use client";

import { useEffect, useState } from "react";
import type { Job } from "@/content/sections";
import { publishJob } from "@/lib/job-store";
import { backendConfigured, supabase } from "@/lib/supabase/client";
import { NeuPanel } from "@/components/neu/Neu";

/**
 * The one choice that carries the rest of the hour.
 *
 * Written through `set_job()` rather than a bare UPDATE. `grant update on
 * public.profiles` is table-wide and a policy that permits an UPDATE permits
 * every column of it, so a definer function that validates the value and
 * touches one column is the narrower door. It also returns a status string this
 * component can render instead of a Postgres error code it would have to
 * translate mid-class.
 *
 * The choice is stored, not just held in state, because the page the attendee
 * leaves with reads it back and because a reload during a live class must not
 * cost them their place.
 */
export function JobPicker({ jobs }: { jobs: Job[] }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const client = supabase();
    if (!client) return;
    let cancelled = false;
    (async () => {
      const { data: session } = await client.auth.getSession();
      if (!session.session || cancelled) return;
      const { data } = await client
        .from("profiles")
        .select("job")
        .eq("id", session.session.user.id)
        .maybeSingle();
      if (!cancelled && data?.job) {
        setChosen(data.job as string);
        publishJob(data.job as string);
      }
    })();
    return () => void (cancelled = true);
  }, []);

  async function pick(id: string) {
    // Chosen on screen first. The rest of the section reads this immediately,
    // and a picker that waited on a round trip before showing a selection would
    // read as broken on a conference network. Published at the same moment so
    // the sections downstream that depend on the pick re-render now rather
    // than on the next reload.
    setChosen(id);
    publishJob(id);

    const client = supabase();
    if (!client) {
      setMessage("Saving is offline. Remember which one you picked.");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      let { data: session } = await client.auth.getSession();
      if (!session.session) {
        const { error } = await client.auth.signInAnonymously();
        if (error) throw error;
        ({ data: session } = await client.auth.getSession());
      }
      const { data, error } = await client.rpc("set_job", { p_job: id });
      if (error) throw error;
      setMessage(data === "ok" ? null : "That did not save. Keep a note of your choice.");
    } catch {
      setMessage("That did not save. Keep a note of your choice.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8">
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((j) => {
          const on = chosen === j.id;
          return (
            <li key={j.id}>
              <NeuPanel
                radius="rounded-[24px]"
                className={`h-full ${on ? "neu-inset" : ""}`}
              >
                <button
                  type="button"
                  data-deck-keys="off"
                  data-job={j.id}
                  aria-pressed={on}
                  onClick={() => void pick(j.id)}
                  className="flex h-full w-full flex-col p-5 text-left md:p-6"
                >
                  <span
                    className="font-sans text-[11px] uppercase tracking-[0.18em]"
                    style={{ color: on ? "var(--accent)" : "var(--text-faint)" }}
                  >
                    {j.verb}
                  </span>
                  <span
                    className="mt-3 font-display text-[1rem] font-semibold leading-snug"
                    style={{ color: "var(--text)" }}
                  >
                    {j.job}
                  </span>
                  <span
                    className="mt-3 text-[0.88rem] leading-relaxed"
                    style={{ color: "var(--text-dim)" }}
                  >
                    {j.user}
                  </span>
                </button>
              </NeuPanel>
            </li>
          );
        })}
      </ul>

      {/* Reserved height, so choosing does not shift the section under a
          presenter who is mid-sentence. */}
      <p
        className="mt-5 min-h-[1.3em] text-[0.9rem]"
        style={{ color: message ? "var(--accent)" : "var(--text-faint)" }}
      >
        {message ??
          (busy
            ? "Saving"
            : chosen
              ? "Saved. Every exercise from here runs against this app."
              : backendConfigured
                ? ""
                : "Pick one. Saving is offline, so keep a note of it.")}
      </p>
    </div>
  );
}
