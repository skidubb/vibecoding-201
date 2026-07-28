"use client";

import { useEffect, useState } from "react";
import { sections } from "@/content/sections";
import { backendConfigured, supabase } from "@/lib/supabase/client";
import { PollWidget } from "@/components/interactive/PollWidget";
import { NeuBadge, NeuPanel } from "@/components/neu/Neu";

/**
 * The poll, on its own, at a short URL.
 *
 * This is the link that goes in Zoom chat. The deck is a long scrolling
 * document driven with arrow keys on a shared screen — asking a hundred people
 * on phones to find the open poll inside it, while the presenter is mid-
 * sentence, is a worse experience than a page with one question on it.
 *
 * It shows whichever poll is open. When none is, it says so rather than
 * guessing, because arriving early and being shown the wrong question is how
 * a vote lands in the wrong tally.
 */
const POLLS = sections.filter((s) => s.poll).map((s) => ({ section: s, poll: s.poll! }));

export default function VotePage() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [checked, setChecked] = useState(!backendConfigured);

  useEffect(() => {
    const client = supabase();
    if (!client) return;

    let cancelled = false;

    const read = async () => {
      // Restricted to polls the deck actually renders. The `rehearsal` poll is
      // permanently open so the vote path can be checked before class, and it
      // must never be what an attendee is shown — relying on it having no
      // section to keep it hidden works, but only by accident.
      const { data } = await client
        .from("polls")
        .select("slug, state")
        .in("slug", POLLS.map((p) => p.poll.slug))
        .in("state", ["open", "revealed"])
        .order("sort", { ascending: true });
      if (cancelled) return;
      setOpenSlug((data?.[0]?.slug as string) ?? null);
      setChecked(true);
    };

    void read();

    // The presenter opening a poll has to reach this page without anyone
    // refreshing, so the same channel the deck uses drives it here too.
    const channel = client
      .channel("vote-page")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "polls" },
        () => void read(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      void client.removeChannel(channel);
    };
  }, []);

  const active = POLLS.find((p) => p.poll.slug === openSlug);

  return (
    <main
      data-theme="dark"
      className="min-h-screen px-5 py-10"
      style={{ background: "var(--surface)", color: "var(--text)" }}
    >
      <div className="mx-auto w-full max-w-2xl">
        <NeuBadge accent>Vibecoding 201 · live poll</NeuBadge>

        {!backendConfigured ? (
          <NeuPanel className="mt-8 px-6 py-8">
            <h1 className="font-display text-2xl font-semibold">Voting is offline.</h1>
            <p className="mt-3" style={{ color: "var(--text-dim)" }}>
              Results are published after the live session. The full deck reads
              without it.
            </p>
          </NeuPanel>
        ) : !checked ? (
          <p className="mt-8" style={{ color: "var(--text-dim)" }}>
            Looking for the open poll…
          </p>
        ) : !active ? (
          <NeuPanel className="mt-8 px-6 py-8">
            <h1 className="font-display text-2xl font-semibold">
              No poll is open yet.
            </h1>
            <p className="mt-3" style={{ color: "var(--text-dim)" }}>
              Leave this page open. It will show the question the moment Scott
              opens it — you do not need to refresh.
            </p>
          </NeuPanel>
        ) : (
          <>
            <h1 className="mt-6 font-display text-[clamp(1.6rem,5vw,2.2rem)] font-semibold leading-tight">
              {active.section.title}
            </h1>
            {active.section.lede && (
              <p className="mt-3" style={{ color: "var(--text-dim)" }}>
                {active.section.lede}
              </p>
            )}
            {active.section.footnote && (
              <NeuPanel variant="flat" radius="rounded-2xl" className="mt-5 px-5 py-4">
                <p style={{ color: "var(--text-dim)" }}>{active.section.footnote}</p>
              </NeuPanel>
            )}
            <PollWidget
              slug={active.poll.slug}
              options={active.poll.options}
              sectionId={active.section.id}
            />
          </>
        )}

        <div className="mt-10 flex gap-6">
          <a
            href="/"
            className="text-[0.9rem] underline underline-offset-4"
            style={{ color: "var(--text-faint)" }}
          >
            Open the full deck
          </a>
          <a
            href="/signin"
            className="text-[0.9rem] underline underline-offset-4"
            style={{ color: "var(--text-faint)" }}
          >
            Sign in
          </a>
        </div>
      </div>
    </main>
  );
}
