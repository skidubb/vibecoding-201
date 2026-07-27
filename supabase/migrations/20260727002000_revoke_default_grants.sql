-- Take back what Supabase granted by default.
--
-- A column grant is additive. `grant select (slug, question, …)` does not
-- narrow an existing table-wide grant, it sits alongside it — so a table that
-- already carries `select` for anon still returns every column, including the
-- correct answer, and the narrower grant achieves nothing.
--
-- Supabase issues that table-wide grant automatically for new tables in public.
-- An earlier revision of the grants block revoked it and a later refactor
-- dropped the revoke while keeping the column grant, which reads as tighter
-- and is in fact wide open.
--
-- Verified against the live project rather than assumed: an anonymous client
-- could read `polls.correct_option_id` for every poll while all four were still
-- closed. The local test suite passed throughout, because it rebuilds the
-- schema in a database that never had Supabase's default privileges — a harness
-- that cannot reproduce production's grants cannot verify production's grants.

revoke select on public.polls from anon, authenticated;
grant select (slug, question, scenario, state, auto_close_at, sort)
  on public.polls to anon, authenticated;

revoke select on public.events from anon, authenticated;
grant select (id, name, section_id, created_at) on public.events to authenticated;

-- Votes are cast through cast_vote(), which is SECURITY DEFINER and checks that
-- the poll is open. Direct writes would bypass that check entirely.
revoke insert, update, delete on public.votes from anon, authenticated;
revoke insert, update, delete on public.poll_tallies from anon, authenticated;
revoke insert, delete on public.polls from anon, authenticated;
revoke insert, update, delete on public.poll_options from anon, authenticated;
revoke delete on public.submissions from anon, authenticated;
revoke select, update, delete on public.events from anon;
