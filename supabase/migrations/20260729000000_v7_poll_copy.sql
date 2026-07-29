-- The four polls, re-cut for v7 of the deck.
--
-- An UPDATE, not an INSERT. All four polls survive the re-cut with the same
-- slugs and the same option ids, so nothing here touches a foreign key and no
-- vote cast in rehearsal is orphaned. The wording is what changed.
--
-- Why this has to be a migration rather than an edit to the seed: seeds only run
-- on a local `db reset`, and `20260727001000_seed_polls.sql` is idempotent by
-- `on conflict do nothing` — which means re-running it against a deployed
-- environment changes nothing at all. The rows are already there. The only way
-- to move deployed copy is to say so explicitly.
--
-- Wording matches `deck-content-v7.md`, including the option text. Attendees see
-- the deck and the site at the same time, so any difference between them is a
-- distraction during the vote.
--
-- Correct answers are unchanged (C, B, C) and remain behind the column grant from
-- `20260727002000_revoke_default_grants.sql`. Poll states are not touched, so a
-- poll that is open when this runs stays open. Closing a live poll during class
-- would be worse than leaving the copy stale for a few minutes.

-- ------------------------------------------------------------------ cold open
-- Was "Which one would you trust to run Monday's retention meeting?" — the
-- scenario moved onto the slide itself, so the panel no longer repeats it.
update public.polls set
  question = 'Which one runs Monday''s retention meeting?',
  scenario = null
where slug = 'cold-open';

update public.poll_options set body = 'Built in twelve minutes. Sample data. Open link.'
where id = 'cold-open:a';

update public.poll_options set
  body = 'Stores real records, controls access, refreshes itself, logs failures.'
where id = 'cold-open:b';

-- ------------------------------------------------------------------ debugging
update public.polls set
  question = 'The build works except for one error that keeps happening. What now?',
  -- "and test a fix" is the addition in this version. Attendees learned the
  -- diagnose step in 101; testing the fix is what prevents the error recurring.
  debrief = 'Debugging is delegation with evidence attached. The 201 addition is "and test a fix" — that is what stops it recurring. A throws away the context that got you this far. B is tool-shopping. D convinces people they need to be engineers.'
where slug = 'debugging';

update public.poll_options set
  body = 'Provide the error, reproduction steps, and expected behavior, then ask the agent to diagnose and test a fix'
where id = 'debugging:c';

-- --------------------------------------------------------- proportionate door
update public.polls set
  question = 'A competitor publishes pricing with no API. Jordan needs a reviewed snapshot every Monday. Most proportionate start?'
where slug = 'proportionate-door';

-- ---------------------------------------------------------------------- priya
update public.polls set
  scenario = 'Priya, Head of Partnerships, built a partner deal-registration app in Lovable on Sunday. Sample data, no sign-in, looks great. She wants to send the link to 40 partners on Monday. What is the right call?'
where slug = 'priya';

update public.poll_options set body = 'Ship it, it is only 40 partners'
where id = 'priya:a';
