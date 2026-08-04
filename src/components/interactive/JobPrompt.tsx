"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { sections } from "@/content/sections";
import { currentJob, subscribeJob } from "@/lib/job-store";
import { supabase } from "@/lib/supabase/client";
import { PromptBlock } from "@/components/interactive/PromptBlock";

const JOBS = sections.find((s) => s.jobs)?.jobs ?? [];

const DATA_URL = "https://storage.googleapis.com/vibecoding-201-data/deals-10k.csv";

/** The one line jobs.md adds to a job, where it adds one. */
const HINT: Record<string, string> = {
  identify: "Treat gone quiet as no recorded activity since 5 May 2026.",
  route: "The data has no manager column. Decide what routing means and say so.",
  prepare: "Use the same definition of quiet as job 1, for a single territory.",
};

const BLANK = "[ your definition of done goes here ]";

/**
 * The prompt for the job this person picked, with their own Done in it.
 *
 * The exercise used to end in a link to the bucket, which is a file offering
 * four ways to reach the data and asking the reader to choose. That is the
 * decision `../../data/kit/jobs.md` exists to remove, reintroduced at the beat
 * the hour turns on. One button, no menu, nobody leaves the deck.
 *
 * **The Done is theirs, never ours.** Writing a canonical Done into this prompt
 * would hand every attendee the same query and every attendee the same number,
 * and the 634-against-834 split is the entire point of the next two minutes.
 * So this composes the Job, which jobs.md gives, with the Done they wrote in the
 * spec block, which jobs.md deliberately withholds. Nothing was submitted yet,
 * the prompt carries a marked blank instead and says so.
 */
export function JobPrompt() {
  const [job, setJob] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  // The pick as it changes on this page. Every section is mounted at once, so
  // a reader who changes their selection up at the picker must see this prompt
  // rebuilt now — the profile fetch below only covers arriving on a reload.
  const liveJob = useSyncExternalStore(subscribeJob, currentJob, () => null);

  useEffect(() => {
    const client = supabase();
    if (!client) return setChecked(true);
    let cancelled = false;

    (async () => {
      const { data: session } = await client.auth.getSession();
      if (!session.session) {
        if (!cancelled) setChecked(true);
        return;
      }
      const [{ data: profile }, { data: spec }] = await Promise.all([
        client.from("profiles").select("job").eq("id", session.session.user.id).maybeSingle(),
        client
          .from("submissions")
          .select("body")
          .eq("exercise_id", "spec")
          .eq("user_id", session.session.user.id)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      setJob((profile?.job as string | null) ?? null);
      setDone(((spec?.body as string | null) ?? "").trim() || null);
      setChecked(true);
    })();

    return () => void (cancelled = true);
  }, []);

  if (!checked && !liveJob) return null;

  const chosen = JOBS.find((j) => j.id === (liveJob ?? job));

  // No project picked, and no session to have picked one in. Rather than a
  // prompt built on a guess, send them back to the slide that makes the choice.
  if (!chosen) {
    return (
      <p className="mt-8 text-[0.95rem]" style={{ color: "var(--text-dim)" }}>
        Choose your project first and this becomes the prompt for it, with your
        own definition of done already in it.
      </p>
    );
  }

  const hint = HINT[chosen.id];
  const text = [
    `Read the CSV at ${DATA_URL}. It is 10,000 sales deals, 36 columns.`,
    "",
    `Job: ${chosen.job}`,
    hint ? `Note: ${hint}` : null,
    "",
    "My definition of done:",
    done ?? BLANK,
    "",
    "Apply exactly that definition. Do not substitute your own. Tell me how many rows it returns, and nothing else.",
  ]
    .filter((l) => l !== null)
    .join("\n");

  return (
    <div className="mt-8">
      <p
        className="font-sans text-[11px] uppercase tracking-[0.18em]"
        style={{ color: "var(--accent)" }}
      >
        {chosen.verb} · your job
      </p>
      <PromptBlock
        label="Your prompt"
        text={text}
        caption={
          done
            ? "The definition of done comes from the spec you wrote. Paste this into your agent and put the number it gives you in the box below."
            : "You have not submitted a spec, so the definition of done is left blank. Replace the bracketed line with yours before running it."
        }
      />
    </div>
  );
}
