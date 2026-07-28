import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminConsole } from "@/components/admin/AdminConsole";
import { NeuBadge, NeuPanel } from "@/components/neu/Neu";

/**
 * The presenter console's front door, and the one URL worth remembering:
 * signed out it routes through /signin and comes back; signed in as anyone
 * but an admin it is indistinguishable from a URL that does not exist.
 *
 * The gate runs on the server so no console markup ever reaches a browser
 * that should not have it — the same posture as /admin/export, which answers
 * 404 rather than 403 so an attendee probing the path learns nothing. The
 * real boundary stays in Postgres either way: every read the console makes is
 * a definer RPC or an RLS-filtered select, so a bypassed page renders empty
 * panels, not data.
 */

export const metadata: Metadata = {
  title: "Presenter console · Vibecoding 201",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const backendOff =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_BACKEND_DISABLED === "1";

export default async function AdminPage() {
  // Before createClient(): server.ts asserts the env vars it reads, so with
  // the backend off the check has to happen here or nowhere.
  if (backendOff) {
    return (
      <main
        data-theme="dark"
        className="flex min-h-screen items-center justify-center px-6"
        style={{ background: "var(--surface)", color: "var(--text)" }}
      >
        <NeuPanel className="w-full max-w-md px-8 py-10">
          <NeuBadge accent>Vibecoding 201 · presenter console</NeuBadge>
          <h1 className="mt-6 font-display text-3xl font-semibold leading-tight">
            The console is offline.
          </h1>
          <p className="mt-3 text-[0.95rem]" style={{ color: "var(--text-dim)" }}>
            The backend is switched off, so there is nothing to run from here.
            The deck still reads in full.
          </p>
          <a
            href="/"
            className="mt-8 inline-block text-[0.9rem] underline underline-offset-4"
            style={{ color: "var(--text-faint)" }}
          >
            Back to the deck
          </a>
        </NeuPanel>
      </main>
    );
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/admin");

  const { data: admin } = await supabase.rpc("is_admin");
  if (admin !== true) notFound();

  return <AdminConsole />;
}
