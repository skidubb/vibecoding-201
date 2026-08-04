# The pre-generated plan

The fallback the *Fire the plan prompt* exercise names. If your plan prompt returned
nothing usable inside the three minutes, take this one and run the counting exercise
against it. It came from the class's own agent, given job 1 (Identify) and the plan
prompt pasted word for word. If you picked a different job, count against this one
anyway — the shape is what transfers.

## The spec it answers

```text
Job:  Every Monday, identify open deals with no recorded activity since 5 May 2026,
      listed by the rep who owns them.
User: A RevOps analyst who sends the list to sales managers on Monday morning.
Done: Open deals in Prospecting, Qualification, Proposal or Negotiation whose last
      activity date falls before 5 May 2026, grouped by rep, with the deals carrying
      no activity date counted separately.
```

## The plan

**Data model.**

- `deals` — the 36 columns from `schema.md`, `transaction_id` as the key, written
  only by the import job.
- `quiet_deals` — a saved query over `deals`: the four open stages, activity before
  5 May 2026, with a flag that keeps the no-date deals a separate bucket.
- `org_members` — which signed-in user belongs to which organisation.
- `import_runs` — one row per import: when it ran, whether it succeeded, how many
  rows, and the error text when it failed.
- `app_events` — one row per meaningful user action, so the Run step has analytics
  to read.

**Permissions.** Row-level security on every table. `deals` and `quiet_deals`
readable only by members of the `revops` organisation. No signed-in user can write
anything except their own `app_events` rows. The import runs with the server-side
service credential and is the only writer. A second account, seeded in a different
organisation, exists so the refusal can be tested rather than assumed.

**Environment variables.** `SUPABASE_URL`, `SUPABASE_ANON_KEY` (safe in a browser —
the row policies are the guard), `SUPABASE_SERVICE_ROLE_KEY` (server only, never in
browser code), `SUPABASE_DB_URL`. Names go in `.env.example`; values go in
`.env.local`, which `.gitignore` keeps out of the repository.

**Failure states.** A failed import is recorded and the page says it failed, next to
the last good import's timestamp. A page that cannot reach the database says so in
words. Zero rows from a healthy run renders "0 quiet deals" beside the timestamp — an
empty list and a broken list are different screens.

**Tests.** Six, each seen failing before it passes: the count (634 across 50 reps,
200 flagged separately) · the cross-organisation refusal · a file with wrong columns
rejected whole and recorded · the same file imported twice leaving one copy of every
row · a missing source file recorded as a failed run · a value surviving a fresh
connection.

**Files.** `supabase/migrations/` for the schema and policies, an import script, a
seed script, the server, the tests, and the six documents from the Build slide.

## Count before you read on

The exercise is identical with this plan and with yours: everything named above that
the 36 columns of `schema.md` do not contain, the plan invented. Count them, submit
your number, then check below.

## The count

**Seven.**

1. Organisations and `org_members` — the deal set has no users and no orgs.
2. The seeded accounts, including the outsider whose only purpose is to be refused.
3. The `quiet_deals` saved query and its no-date flag.
4. `import_runs` — no run history exists anywhere in the contract.
5. `app_events` — no analytics exists anywhere in the contract.
6. A writer role at all — the bucket is public and read-only; "the import is the only
   writer" is the plan's own construction.
7. The header mapping — the contract's lowercase names against the file's Title_Case
   headers. Treating them as the same 36 columns is an assumption the plan chose to
   own, and verified column by column.

Found more than seven? You may be right — the count that matters is the one you can
point at, line by line.
