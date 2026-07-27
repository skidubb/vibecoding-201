import { NeuPanel, NeuBadge } from "@/components/neu/Neu";

/**
 * The page a failed sign-in actually reaches.
 *
 * It exists because the alternative — redirecting to the deck with no session —
 * looks exactly like success until the moment someone tries to vote. The deck
 * spends a section on that distinction, so this page names the failure and
 * gives the way around it.
 */
export default function AuthErrorPage() {
  return (
    <main
      data-theme="dark"
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "var(--surface)", color: "var(--text)" }}
    >
      <NeuPanel className="w-full max-w-md px-8 py-10">
        <NeuBadge accent>Sign-in failed</NeuBadge>

        <h1 className="mt-6 font-display text-3xl font-semibold leading-tight">
          That link did not sign you in.
        </h1>

        <p className="mt-4 text-[0.95rem]" style={{ color: "var(--text-dim)" }}>
          Emailed links expire, and they only work once. Corporate sign-on and
          in-app browsers also block the Google popup.
        </p>

        <p className="mt-4 text-[0.95rem]" style={{ color: "var(--text-dim)" }}>
          Nothing is lost. You do not need an account to vote — the polls sign you
          in anonymously on the first tap, and everything on the deck reads
          without signing in at all.
        </p>

        <div className="mt-8 flex gap-6">
          <a
            href="/signin"
            className="text-[0.95rem] underline underline-offset-4"
            style={{ color: "var(--accent)" }}
          >
            Try again
          </a>
          <a
            href="/"
            className="text-[0.95rem] underline underline-offset-4"
            style={{ color: "var(--text-dim)" }}
          >
            Back to the deck
          </a>
        </div>
      </NeuPanel>
    </main>
  );
}
