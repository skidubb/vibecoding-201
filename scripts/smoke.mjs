/**
 * Live smoke test, against the real Supabase project.
 *
 * The Playwright suite runs with the backend switched off, so it proves the
 * site degrades correctly and proves nothing about whether voting works. This
 * proves the other half, and it runs against production because that is the
 * only place the answers are true: row-level security behaves differently in a
 * database that has Supabase's default grants than in one rebuilt from the
 * migrations alone. That difference once hid a real leak — an anonymous client
 * could read every poll's correct answer while the local suite stayed green.
 *
 * Every write goes to the `rehearsal` poll, which no section renders, so this
 * can be run the morning of the class without touching a tally the room sees.
 *
 *   npm run smoke
 */
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!URL || !KEY) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  process.exit(1);
}

let failures = 0;
const check = (ok, message) => {
  if (!ok) failures += 1;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${message}`);
};

const anon = createClient(URL, KEY);

console.log("\nreadable without an account");
const { data: polls, error: pollsError } = await anon
  .from("polls")
  .select("slug,state,question")
  .order("sort");
check(!pollsError && polls.length >= 4, `every poll's question (${polls?.length ?? pollsError?.message})`);
check(
  polls?.filter((p) => p.slug !== "rehearsal").every((p) => p.state === "closed"),
  "and every class poll is still closed",
);

console.log("\nwithheld");
const { error: leak } = await anon.from("polls").select("correct_option_id").limit(1);
check(Boolean(leak), "the correct answer, from an anonymous reader");
const { data: early } = await anon.rpc("poll_reveal", { p_poll_slug: "debugging" });
check((early ?? []).length === 0, "and from poll_reveal while the poll is closed");

console.log("\nthe vote path, against the rehearsal poll");
const a = createClient(URL, KEY);
const b = createClient(URL, KEY);
await a.auth.signInAnonymously();
await b.auth.signInAnonymously();
check(Boolean((await a.auth.getSession()).data.session), "anonymous sign-in");

const { error: alsoLeak } = await a.from("polls").select("correct_option_id").limit(1);
check(Boolean(alsoLeak), "the answer stays withheld from a signed-in attendee");

const before = ((await a.from("poll_tallies").select("votes").eq("poll_slug", "rehearsal")).data ?? [])
  .reduce((sum, row) => sum + row.votes, 0);

let delivered = 0;
const channel = b
  .channel("smoke:rehearsal")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "poll_tallies", filter: "poll_slug=eq.rehearsal" },
    () => { delivered += 1; },
  );
await new Promise((resolve) => channel.subscribe((s) => s === "SUBSCRIBED" && resolve()));
check(true, "a client can subscribe to a poll's tally");

check((await a.rpc("cast_vote", { p_poll_slug: "rehearsal", p_option_id: "rehearsal:b" })).data === "ok", "a vote is accepted");
check((await a.rpc("cast_vote", { p_poll_slug: "rehearsal", p_option_id: "rehearsal:a" })).data === "already_voted", "a second vote from the same account is refused");
check((await b.rpc("cast_vote", { p_poll_slug: "rehearsal", p_option_id: "rehearsal:a" })).data === "ok", "a different account votes independently");
check((await a.rpc("cast_vote", { p_poll_slug: "closed-poll-that-does-not-exist", p_option_id: "x" })).data === "unknown_poll", "an unknown poll is rejected");

await new Promise((r) => setTimeout(r, 4000));
const after = ((await a.from("poll_tallies").select("votes").eq("poll_slug", "rehearsal")).data ?? [])
  .reduce((sum, row) => sum + row.votes, 0);
check(after === before + 2, `the tally counted both (${before} → ${after})`);
check(delivered > 0, "and realtime pushed the change to the other client");

console.log("\nauthorization");
check(((await a.from("votes").select("*")).data ?? []).length === 1, "an attendee reads exactly one vote row — their own");
check(Boolean((await a.from("votes").insert({ poll_slug: "rehearsal", option_id: "rehearsal:a", user_id: (await a.auth.getSession()).data.session.user.id }).select()).error), "a direct insert into votes is blocked");
await a.from("polls").update({ state: "open" }).eq("slug", "debugging");
check(((await anon.from("polls").select("state").eq("slug", "debugging").single()).data)?.state === "closed", "an attendee cannot open a poll");

// Leave the rehearsal tally where it was found.
await a.from("votes").delete().eq("poll_slug", "rehearsal");
await b.removeChannel(channel);

// ------------------------------------------------------------- submissions
//
// The spec exercise stores free text that a presenter may read to a hundred
// people, so the questions worth asking are all about who can see it and who
// can put it on screen. Written under `smoke`, never `spec`: the deck reads
// only `spec`, and `delete` is revoked from every client role, so these rows
// cannot be cleaned up afterwards and must not land where the class looks.
console.log("\nthe submission path");
const EX = "smoke";
const aId = (await a.auth.getSession()).data.session.user.id;

const { error: wrote } = await a
  .from("submissions")
  .upsert({ exercise_id: EX, user_id: aId, body: "Job / User / Done" }, { onConflict: "exercise_id,user_id" });
check(!wrote, `a submission is accepted (${wrote?.message ?? "ok"})`);

const { error: again } = await a
  .from("submissions")
  .upsert({ exercise_id: EX, user_id: aId, body: "Job / User / Done, tightened" }, { onConflict: "exercise_id,user_id" });
const mine = (await a.from("submissions").select("id,body").eq("exercise_id", EX)).data ?? [];
check(!again && mine.length === 1, `a second submission edits the first rather than duplicating it (${mine.length} row)`);

check(
  Boolean((await b.from("submissions").select("*").eq("exercise_id", EX)).data?.length === 0),
  "another attendee cannot read it",
);

const { error: forged } = await a
  .from("submissions")
  .update({ user_id: (await b.auth.getSession()).data.session.user.id })
  .eq("exercise_id", EX);
check(Boolean(forged), "and cannot be reassigned to somebody else");

// The author-consent constraint, asked of production rather than of a local
// rebuild. `surfaced_at` is what puts a submission on the projected screen;
// setting it without `shared_at` has to fail in the database, because the
// presenter's UI is not the thing standing between private work and a room.
const { error: jumped } = await a
  .from("submissions")
  .update({ surfaced_at: new Date().toISOString() })
  .eq("exercise_id", EX);
check(Boolean(jumped), "nothing reaches the screen without its author sharing it first");

await a.from("submissions").update({ shared_at: new Date().toISOString() }).eq("exercise_id", EX);
check(
  ((await b.from("submissions").select("*").eq("exercise_id", EX)).data ?? []).length === 0,
  "sharing offers it to the presenter, and still not to the room",
);

// Whether an attendee can put their own text on the projected screen.
const { error: selfSurfaced } = await a
  .from("submissions")
  .update({ surfaced_at: new Date().toISOString() })
  .eq("exercise_id", EX);
const roomSees = ((await b.from("submissions").select("*").eq("exercise_id", EX)).data ?? []).length;
check(
  Boolean(selfSurfaced) && roomSees === 0,
  `only the presenter decides what the room sees (self-surfaced: ${selfSurfaced ? "refused" : "ALLOWED"}, room sees ${roomSees})`,
);

await a.from("submissions").update({ shared_at: null, surfaced_at: null }).eq("exercise_id", EX);

// ------------------------------------------------------------------ export
//
// The export is the one place emails appear, so the gate is asked of the
// database in each function's own body rather than trusted to the route. These
// are the calls an attendee could make with the publishable key in their
// browser console: each has to come back empty, not merely be hard to find.
console.log("\nthe export, from an attendee's session");
for (const fn of ["admin_poll_results", "admin_submissions", "admin_kit_requests", "admin_event_counts"]) {
  const { data, error } = await a.rpc(fn);
  check(!error && (data ?? []).length === 0, `${fn}() returns nothing (${error?.message ?? `${(data ?? []).length} rows`})`);
}
const { data: anonExport } = await anon.rpc("admin_kit_requests");
check((anonExport ?? []).length === 0, "and nothing to a reader with no account at all");
const { data: anonCounts } = await anon.rpc("admin_event_counts");
check((anonCounts ?? []).length === 0, "event counts refuse a reader with no account too");

// ------------------------------------------------------------------ console
//
// The console's own gates live in the deployed app, not the database, so they
// are checked from outside: a signed-out visit must be routed through sign-in
// (with a way back), and the export route must still demand a session.
console.log("\nthe console, from outside");
const SITE = process.env.SMOKE_SITE_URL ?? "https://crossing-the-gap-site.vercel.app";
const door = await fetch(`${SITE}/admin`, { redirect: "manual" });
const doorLocation = door.headers.get("location") ?? "";
check(
  [303, 307, 308].includes(door.status) && doorLocation.includes("/signin") && doorLocation.includes("next="),
  `a signed-out /admin routes through sign-in and back (${door.status} → ${doorLocation || "no location"})`,
);
const exportDoor = await fetch(`${SITE}/admin/export`);
check(exportDoor.status === 401, `and the export still asks for a session first (${exportDoor.status})`);

console.log(failures === 0 ? "\nall good\n" : `\n${failures} failed\n`);
process.exit(failures === 0 ? 0 : 1);
