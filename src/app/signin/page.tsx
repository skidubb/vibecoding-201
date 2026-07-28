"use client";

import { useState } from "react";
import { backendConfigured, supabase } from "@/lib/supabase/client";
import { NeuPanel, NeuButton, NeuBadge } from "@/components/neu/Neu";

type State = "idle" | "working" | "sent" | "error";

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
 * Sign-in.
 *
 * Google first, because it is one tap and the room is on laptops they are
 * already signed into. Email is offered but labelled for after the session:
 * the default SMTP allows two messages an hour and delivery takes a minute or
 * more, which cannot work inside the forty-five seconds a poll is open. Anyone
 * who just wants to vote does not need this page at all — the poll signs them
 * in anonymously on their first tap.
 */
export default function SignInPage() {
  const [state, setState] = useState<State>("idle");
  const [email, setEmail] = useState("");
  const [wantsKit, setWantsKit] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function withGoogle() {
    const client = supabase();
    if (!client) return;
    setState("working");
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?kit=${wantsKit ? 1 : 0}&next=${encodeURIComponent(nextPath())}`,
      },
    });
    if (error) {
      setState("error");
      setMessage("Google sign-in did not open. You can still vote without an account.");
    }
  }

  async function withEmail(e: React.FormEvent) {
    e.preventDefault();
    const client = supabase();
    if (!client) return;
    setState("working");
    const { error } = await client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?kit=${wantsKit ? 1 : 0}&next=${encodeURIComponent(nextPath())}`,
      },
    });
    if (error) {
      setState("error");
      setMessage("That did not send. Check the address, or use Google above.");
      return;
    }
    setState("sent");
    setMessage("Check your email. The link signs you in.");
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
          You do not need an account to vote — the polls sign you in anonymously.
          An account saves your spec submission and lets Scott send you the kit.
        </p>

        {!backendConfigured ? (
          <p className="mt-8 text-[0.95rem]" style={{ color: "var(--accent)" }}>
            Accounts are offline right now. The deck still reads in full, and the
            polls will say the same thing.
          </p>
        ) : (
          <>
            <label
              className="mt-8 flex cursor-pointer items-start gap-3 text-[0.9rem]"
              style={{ color: "var(--text-dim)" }}
            >
              <input
                type="checkbox"
                checked={wantsKit}
                onChange={(e) => setWantsKit(e.target.checked)}
                className="mt-1"
              />
              <span>Email me the kit — the checklist, the prompt pack, and the repo starter.</span>
            </label>

            <div className="mt-6">
              <NeuButton onClick={withGoogle} className="w-full">
                {state === "working" ? "Opening…" : "Continue with Google"}
              </NeuButton>
            </div>

            <form onSubmit={withEmail} className="mt-8">
              <label
                className="block text-[11px] uppercase tracking-[0.18em]"
                style={{ color: "var(--text-faint)" }}
              >
                Or by email — best after the session
              </label>
              <div className="mt-3 flex gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="neu-inset neu-edge min-w-0 flex-1 rounded-full px-5 py-3 text-[0.95rem] outline-none"
                  style={{ color: "var(--text)" }}
                />
                <button
                  type="submit"
                  className="neu-raised neu-edge rounded-full px-5 py-3 font-display text-sm"
                  style={{ color: "var(--text)" }}
                >
                  Send
                </button>
              </div>
            </form>
          </>
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
