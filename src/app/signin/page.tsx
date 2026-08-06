"use client";

import { useState } from "react";
import { backendConfigured, supabase } from "@/lib/supabase/client";
import { NeuPanel, NeuButton, NeuBadge } from "@/components/neu/Neu";

type State = "idle" | "working" | "error";

/**
 * Where to land after the callback, read from ?next=. Handler-only — not
 * useSearchParams(), which would demand a Suspense boundary around the page —
 * and validated to a same-origin relative path so the round trip through the
 * OAuth provider cannot become an open redirect.
 */
function nextPath(): string {
  const raw = new URLSearchParams(window.location.search).get("next") ?? "/";
  return raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("\\") ? raw : "/";
}

/**
 * Sign-in. Google only.
 *
 * The email magic-link path and the "email me the kit" checkbox were cut on
 * Scott's 2026-08-05 punch list: nothing here sends email, and a sign-in flow
 * that promises one is worse than none. Collecting an address without a
 * verification step would also mean storing addresses anyone could type on
 * anyone's behalf. Anyone who just wants to vote does not need this page at
 * all — the poll signs them in anonymously on their first tap.
 */
export default function SignInPage() {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function withGoogle() {
    const client = supabase();
    if (!client) return;
    setState("working");
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath())}`,
      },
    });
    if (error) {
      setState("error");
      setMessage("Google sign-in did not open. You can still vote without an account.");
    }
  }

  return (
    <main
      data-theme="dark"
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "var(--surface)", color: "var(--text)" }}
    >
      <NeuPanel className="w-full max-w-md px-8 py-10">
        <NeuBadge accent>Vibecoding 201</NeuBadge>

        <h1 className="mt-6 font-display text-3xl font-semibold leading-tight">
          Sign in
        </h1>
        <p className="mt-3 text-[0.95rem]" style={{ color: "var(--text-dim)" }}>
          You do not need an account to vote. The polls sign you in anonymously.
          An account saves what you submit — your spec, your verdict, your
          checklist — so it is still yours after class.
        </p>

        {!backendConfigured ? (
          <p className="mt-8 text-[0.95rem]" style={{ color: "var(--accent)" }}>
            Accounts are offline right now. The deck still reads in full, and the
            polls will say the same thing.
          </p>
        ) : (
          <div className="mt-8">
            <NeuButton onClick={withGoogle} className="w-full">
              {state === "working" ? "Opening…" : "Continue with Google"}
            </NeuButton>
          </div>
        )}

        <p
          aria-live="polite"
          className="mt-6 min-h-[1.5rem] text-[0.9rem]"
          style={{ color: state === "error" ? "var(--accent)" : "var(--text-dim)" }}
        >
          {message}
        </p>

        <a
          href="/"
          className="mt-2 inline-block text-[0.9rem] underline underline-offset-4"
          style={{ color: "var(--text-dim)" }}
        >
          Back to the deck
        </a>
      </NeuPanel>
    </main>
  );
}
