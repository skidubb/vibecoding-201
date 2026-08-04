"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { currentJob, subscribeJob } from "@/lib/job-store";
import { supabase } from "@/lib/supabase/client";
import { PromptBlock } from "@/components/interactive/PromptBlock";

const DATA_URL = "https://storage.googleapis.com/vibecoding-201-data/deals-10k.csv";

const BLANK = "[ your definition of done goes here ]";

/**
 * The prompt for the app this person chose, with their own Done in it.
 *
 * Two shapes since Scott's 2026-08-04 ruling replaced the job menu. The
 * starter path runs the went-quiet job against the CRM data the starter app
 * carries — the CSV is named by URL so the prompt also works for someone in a
 * chat assistant who never opened the app folder. The own-app path runs the
 * reader's Done against their own project, and its check is different because
 * nobody publishes a target number for their app: the same Done run twice has
 * to return the same number.
 *
 * **The Done is theirs, never ours.** Writing a canonical Done into this prompt
 * would hand every attendee the same query and every attendee the same number,
 * and the 634-against-834 split is the entire point of the next two minutes.
 * So this composes the Job with the Done they wrote in the spec block. If
 * nothing was submitted yet, the prompt carries a marked blank instead and
 * says so.
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

  const picked = liveJob ?? job;
  // Rows written before 2026-08-04 hold one of the six legacy job values.
  // Every legacy job ran against the same CRM data the starter app carries,
  // so the starter prompt is the one that still fits them.
  const own = picked === "own";

  // Nothing picked, and no session to have picked in. Rather than a prompt
  // built on a guess, send them back to the slide that makes the choice.
  if (!picked) {
    return (
      <p className="mt-8 text-[0.95rem]" style={{ color: "var(--text-dim)" }}>
        Choose the starter app or your own app first and this becomes the
        prompt for it, with your own definition of done already in it.
      </p>
    );
  }

  const text = own
    ? [
        "Open this project — the app I already built.",
        "",
        "My definition of done:",
        done ?? BLANK,
        "",
        "Apply exactly that definition against this app's own data. Do not substitute your own. Run it twice. Tell me the number each run returns, and nothing else. If the two numbers differ, say so first.",
      ].join("\n")
    : [
        `Read the CSV at ${DATA_URL}. It is 10,000 sales deals, 36 columns — the CRM data inside the starter app.`,
        "If that URL is unreachable from your environment (a 403 from a cloud workspace), download the file in a browser, attach it here, and continue.",
        "",
        "Job: Identify open deals that have gone quiet, and list them by the rep who owns them.",
        "Note: Treat gone quiet as no recorded activity since 5 May 2026.",
        "",
        "My definition of done:",
        done ?? BLANK,
        "",
        "Apply exactly that definition. Do not substitute your own. Tell me how many rows it returns, and nothing else.",
      ].join("\n");

  return (
    <div className="mt-8">
      <p
        className="font-sans text-[11px] uppercase tracking-[0.18em]"
        style={{ color: "var(--accent)" }}
      >
        {own ? "Your own app" : "The starter app"} · your prompt
      </p>
      <PromptBlock
        label="Your prompt"
        text={text}
        caption={
          done
            ? own
              ? "The definition of done comes from the spec you wrote. Paste this into your agent and put the number it gives you in the box below. The check on your own data is that both runs return the same number."
              : "The definition of done comes from the spec you wrote. Paste this into your agent and put the number it gives you in the box below."
            : "You have not submitted a spec, so the definition of done is left blank. Replace the bracketed line with yours before running it."
        }
      />
    </div>
  );
}
