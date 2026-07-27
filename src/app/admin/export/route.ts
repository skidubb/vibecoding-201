import { createClient } from "@/lib/supabase/server";

/**
 * The post-class export.
 *
 * Gated by `is_admin()` asked of the database, not by the URL being hard to
 * guess. Every read goes through a definer function that asks the same question
 * again in its own body, so this handler getting the check wrong would still
 * return nothing — the gate is not in this file, it is in Postgres, and this
 * file only decides what to do with a refusal.
 *
 * Emails appear here and nowhere else on the site, and only for people who
 * ticked the box. Submissions appear only where their author shared them.
 *
 *   /admin/export            → everything, as one CSV per section
 *   /admin/export?set=polls  → polls | submissions | kit
 */

export const dynamic = "force-dynamic";

/** RFC 4180: quote everything, double the quotes inside. */
function csv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const columns = Object.keys(rows[0]);
  const cell = (value: unknown) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((c) => cell(row[c])).join(",")),
  ].join("\n");
}

const SETS = {
  polls: "admin_poll_results",
  submissions: "admin_submissions",
  kit: "admin_kit_requests",
} as const;

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Sign in first.\n", { status: 401 });
  }

  const { data: admin } = await supabase.rpc("is_admin");
  if (admin !== true) {
    // 404, not 403. A signed-in attendee poking at this URL learns nothing
    // about whether it exists, and the honest answer to "may I have the room's
    // email addresses" is not a hint that there is a door here.
    return new Response("Not found.\n", { status: 404 });
  }

  const asked = new URL(request.url).searchParams.get("set");
  const wanted =
    asked && asked in SETS ? [asked as keyof typeof SETS] : (Object.keys(SETS) as (keyof typeof SETS)[]);

  const parts: string[] = [];
  for (const key of wanted) {
    const { data, error } = await supabase.rpc(SETS[key]);
    if (error) {
      return new Response(`${key}: ${error.message}\n`, { status: 500 });
    }
    parts.push(`# ${key}\n${csv((data as Record<string, unknown>[]) ?? [])}`);
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(parts.join("\n\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="vibecoding-201-${stamp}.csv"`,
      // Never a shared cache. This body contains email addresses.
      "cache-control": "no-store, private",
    },
  });
}
