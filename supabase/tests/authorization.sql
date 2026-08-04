-- The authorization claims, exercised rather than asserted.
--
-- Slide 21 tells the room that hiding records in the interface is not security
-- and hands them a test they can run without an engineer: sign in as one
-- tenant, ask for another tenant's record, and require the request to fail.
-- This is that test, run against this site's own schema and the data the room
-- itself creates by voting.
--
-- Run it against a throwaway Postgres (see supabase/tests/README.md). It found
-- a real defect the first time: an admin could not surface any submission,
-- because Postgres applies SELECT policies to the rows an UPDATE reads and no
-- SELECT policy matched an unsurfaced row. The update silently touched zero
-- rows, which is the quiet failure this class exists to argue against.

\set ON_ERROR_STOP off
\set ADMIN '''33333333-3333-3333-3333-333333333333'''
\set ALICE '''11111111-1111-1111-1111-111111111111'''
\set BOB   '''22222222-2222-2222-2222-222222222222'''

-- Recreated, not upserted: public.profiles is populated by a trigger on
-- auth.users, so a user row that already exists leaves no profile behind and
-- every foreign key downstream fails for a reason that looks unrelated.
delete from auth.users where id in (:ALICE, :BOB, :ADMIN);
insert into auth.users (id, email) values
  (:ALICE,'a@example.com'), (:BOB,'b@example.com'), (:ADMIN,'scott@example.com');
insert into public.app_admins (user_id) values (:ADMIN) on conflict do nothing;

\echo ''
\echo '1  an attendee cannot open a poll'
set role authenticated; set test.uid = :ADMIN; set test.uid = :ALICE;
update public.polls set state='open' where slug='debugging';
select case when count(*)=0 then 'PASS' else 'FAIL' end || '  poll still closed'
  from public.polls where slug='debugging' and state='open';
reset role;

\echo '2  the presenter can'
set role authenticated; set test.uid = :ADMIN;
update public.polls set state='open' where slug='debugging';
select case when state='open' then 'PASS' else 'FAIL' end || '  presenter opened it'
  from public.polls where slug='debugging';
reset role;

\echo '3  one vote per account, enforced by a primary key'
set role authenticated; set test.uid = :ALICE;
select case when public.cast_vote('debugging','debugging:c')='ok' then 'PASS' else 'FAIL' end || '  first vote accepted';
select case when public.cast_vote('debugging','debugging:a')='already_voted' then 'PASS' else 'FAIL' end || '  second vote refused';
reset role;
set role authenticated; set test.uid = :BOB;
select case when public.cast_vote('debugging','debugging:a')='ok' then 'PASS' else 'FAIL' end || '  a different account may vote';

\echo '4  slide 21: one attendee asks for another attendee''s vote'
select case when count(*)=0 then 'PASS' else 'FAIL' end || '  no rows belonging to anyone else'
  from public.votes where user_id <> :BOB;
reset role;

\echo '5  the answer is withheld while the poll is open'
set role authenticated; set test.uid = :ALICE;
select case when count(*)=0 then 'PASS' else 'FAIL' end || '  poll_reveal returns nothing'
  from public.poll_reveal('debugging');
reset role;

\echo '6  and the column is not readable at all (expect: permission denied)'
set role authenticated; set test.uid = :ALICE;
select correct_option_id from public.polls where slug='debugging';
reset role;

\echo '7  revealing releases it, and only then'
set role authenticated; set test.uid = :ADMIN;
update public.polls set state='revealed' where slug='debugging';
reset role;
set role authenticated; set test.uid = :ALICE;
select case when correct_option_id='debugging:c' then 'PASS' else 'FAIL' end || '  answer released on reveal'
  from public.poll_reveal('debugging');
reset role;

\echo '8  a private submission is invisible to the presenter'
set role authenticated; set test.uid = :ALICE;
insert into public.submissions (exercise_id, user_id, body) values ('spec', :ALICE, 'Job / User / Done')
on conflict do nothing;
reset role;
set role authenticated; set test.uid = :ADMIN;
select case when count(*)=0 then 'PASS' else 'FAIL' end || '  presenter cannot see it' from public.submissions;
update public.submissions set surfaced_at = now() where exercise_id='spec';
reset role;
set role authenticated; set test.uid = :ALICE;
select case when surfaced_at is null then 'PASS' else 'FAIL' end || '  and could not publish it'
  from public.submissions where exercise_id='spec';

\echo '9  once the author shares it, the presenter can surface it'
update public.submissions set shared_at = now() where exercise_id='spec';
reset role;
set role authenticated; set test.uid = :ADMIN;
update public.submissions set surfaced_at = now() where exercise_id='spec';
select case when count(*)=1 then 'PASS' else 'FAIL' end || '  presenter surfaced the shared one'
  from public.submissions where surfaced_at is not null;
reset role;

\echo '10 an author cannot put their own submission on the room screen'
-- Test 8 asked whether an admin could publish something private. It could not,
-- and that answer was mistaken for the whole question. Nobody had asked whether
-- an *author* could publish their own — and until the policy below was
-- narrowed, they could: `surfaced_at` is what the deck renders to everyone, and
-- the author's update policy named no columns. Any attendee could push their
-- own text onto the projected screen. Found in production by `npm run smoke`.
set role authenticated; set test.uid = :ALICE;
update public.submissions set surfaced_at = null where exercise_id='spec';
select case when count(*)=0 then 'PASS' else 'FAIL' end || '  the author can take their own work down'
  from public.submissions where exercise_id='spec' and surfaced_at is not null;
update public.submissions set surfaced_at = now() where exercise_id='spec';
select case when count(*)=0 then 'PASS' else 'FAIL' end || '  but cannot put it back up themselves'
  from public.submissions where exercise_id='spec' and surfaced_at is not null;
reset role;

\echo ''
\echo '11 an attendee picks their own job, and only a job that exists'
set role authenticated; set test.uid = :ALICE;
select case when public.set_job('identify')='ok' then 'PASS' else 'FAIL' end || '  a known job is accepted';
select case when public.set_job('drop-table')='unknown-job' then 'PASS' else 'FAIL' end || '  an unknown one is refused by name';
select case when job='identify' then 'PASS' else 'FAIL' end || '  and the refusal left the first choice alone'
  from public.profiles where id=:ALICE;
reset role;

\echo '12 picking a job touches one row, not the room'
-- set_job() is SECURITY DEFINER, so it runs with rights the caller does not
-- have. The question that matters for a definer function is not whether it
-- works but whose row it writes: it names auth.uid() rather than taking an id.
set role authenticated; set test.uid = :BOB;
select public.set_job('reconcile');
reset role;
select case when count(*)=1 then 'PASS' else 'FAIL' end || '  alice still owns her own choice'
  from public.profiles where id=:ALICE and job='identify';

\echo '13 a tally counts people, and a changed answer moves rather than doubles'
set role authenticated; set test.uid = :ALICE;
insert into public.submissions (exercise_id, user_id, body, answer)
  values ('done-count', :ALICE, '634', 634)
  on conflict (exercise_id, user_id) do update set body=excluded.body, answer=excluded.answer;
reset role;
select case when people=1 then 'PASS' else 'FAIL' end || '  one person on 634'
  from public.answer_tallies where exercise_id='done-count' and answer=634;

set role authenticated; set test.uid = :ALICE;
update public.submissions set answer=834 where exercise_id='done-count' and user_id=:ALICE;
reset role;
select case when coalesce((select people from public.answer_tallies
    where exercise_id='done-count' and answer=634), 0)=0
  then 'PASS' else 'FAIL' end || '  634 gave the person back';
select case when people=1 then 'PASS' else 'FAIL' end || '  and 834 has them now'
  from public.answer_tallies where exercise_id='done-count' and answer=834;

\echo '14 the trigger is the only writer, and the room may still read'
set role authenticated; set test.uid = :ALICE;
insert into public.answer_tallies (exercise_id, answer, people) values ('done-count', 1, 9999);
select case when count(*)=0 then 'PASS' else 'FAIL' end || '  an attendee cannot invent a tally'
  from public.answer_tallies where exercise_id='done-count' and answer=1;
update public.answer_tallies set people=9999 where exercise_id='done-count';
select case when count(*)=0 then 'PASS' else 'FAIL' end || '  nor inflate a real one'
  from public.answer_tallies where people=9999;
reset role;
set role anon;
select case when count(*)>0 then 'PASS' else 'FAIL' end || '  and a signed-out reader still sees the distribution'
  from public.answer_tallies where exercise_id='done-count';
reset role;

\echo '15 a tally is an aggregate, and carries no author'
-- The whole argument for publishing this table is that it says how many people
-- chose a number and not which people. If a user_id ever appears here, the
-- histogram becomes a roster and the split between votes and poll_tallies has
-- been quietly undone.
select case when count(*)=0 then 'PASS' else 'FAIL' end || '  no column on answer_tallies identifies anyone'
  from information_schema.columns
 where table_schema='public' and table_name='answer_tallies'
   and column_name in ('user_id','email','display_name');
