-- The deal set, carried through the hour.
--
-- Three additions, all in service of one change: an exercise now returns
-- something to the person who did it, and an aggregate to the room.
--
--   1. profiles.job      the job each attendee picks once and keeps
--   2. submissions.answer the numeric datum an exercise produces
--   3. answer_tallies    that datum aggregated, readable by everyone
--
-- The privacy argument is the one already made by votes and poll_tallies: an
-- individual answer is the author's, a tally is the room's. Nothing here lets
-- anyone read another attendee's submission who could not read it before.

-- ------------------------------------------------------------------- the job
--
-- One of the six in ../data/kit/jobs.md. Constrained here rather than in the
-- interface because the value is read back by the per-person page and grouped
-- on by the presenter console: a free-text column would let one typo split a
-- cohort in two and there would be no way to tell afterwards.
alter table public.profiles
  add column if not exists job text
    constraint profiles_job_is_known check (
      job is null or job in
        ('identify', 'reconcile', 'route', 'prepare', 'summarize', 'approve')
    );

comment on column public.profiles.job is
  'Which of the six jobs from data/kit/jobs.md this attendee is building against.';

-- Setting it goes through a function, for the reason cast_vote() does.
--
-- `grant update on public.profiles` is table-wide, and a policy that permits an
-- UPDATE permits every column of it. Rather than widen what the room can write
-- to its own row, this validates the value and touches exactly one column. The
-- caller gets a status string it can render instead of a Postgres error code it
-- would have to translate.
create or replace function public.set_job(p_job text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return 'anonymous';
  end if;

  if p_job is not null and p_job not in
    ('identify', 'reconcile', 'route', 'prepare', 'summarize', 'approve') then
    return 'unknown-job';
  end if;

  update public.profiles set job = p_job where id = auth.uid();

  if not found then
    return 'no-profile';
  end if;

  return 'ok';
end;
$$;

-- --------------------------------------------------------------- the answer
--
-- The number an exercise produces, beside the prose in `body`.
--
-- Two exercises produce one: the row count a Done returns, and the count of
-- what a plan invented. A third produces a score out of nine. All three are
-- integers, which is what makes the tally below bounded: a free-text column
-- aggregated by value would grow a bucket per distinct sentence.
alter table public.submissions
  add column if not exists answer int;

comment on column public.submissions.answer is
  'The integer an exercise asked for. Null for prose-only exercises.';

-- --------------------------------------------------------------- the tally
--
-- Maintained by trigger and readable by everyone including anonymous visitors,
-- so the room sees its own distribution while each submission stays with its
-- author. Same split as votes and poll_tallies, for the same reason.
--
-- This is the slide that carries job 1: two defensible readings of "gone quiet"
-- return 634 and 834, and the room discovers that from its own numbers rather
-- than from the presenter asserting it.
create table if not exists public.answer_tallies (
  exercise_id text not null,
  answer      int  not null,
  people      int  not null default 0,
  primary key (exercise_id, answer)
);

comment on table public.answer_tallies is
  'How many people gave each answer. An aggregate is not a submission.';

-- Insert, update and delete all have to move the count, because a submission
-- is an upsert: the unique constraint on (exercise_id, user_id) means changing
-- an answer is an UPDATE of an existing row, not a second INSERT. Counting
-- only inserts would leave the first answer in the tally forever.
create or replace function public.on_submission_answer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old int := case when tg_op in ('UPDATE', 'DELETE') then old.answer end;
  v_new int := case when tg_op in ('INSERT', 'UPDATE') then new.answer end;
  v_exercise text := coalesce(new.exercise_id, old.exercise_id);
begin
  if v_old is not distinct from v_new then
    return coalesce(new, old);
  end if;

  if v_old is not null then
    update public.answer_tallies
       set people = greatest(people - 1, 0)
     where exercise_id = v_exercise and answer = v_old;
  end if;

  if v_new is not null then
    insert into public.answer_tallies (exercise_id, answer, people)
    values (v_exercise, v_new, 1)
    on conflict (exercise_id, answer)
    do update set people = public.answer_tallies.people + 1;
  end if;

  -- Best effort, exactly as on_vote_inserted() treats its broadcast: a missed
  -- send costs one stale histogram until the next read, while letting the
  -- exception out would cost the submission itself.
  begin
    perform realtime.send(
      jsonb_build_object('exercise_id', v_exercise),
      'tally',
      'exercise:' || v_exercise,
      false
    );
  exception when others then
    null;
  end;

  return coalesce(new, old);
end;
$$;

drop trigger if exists submissions_answer_tally on public.submissions;
create trigger submissions_answer_tally
  after insert or update or delete on public.submissions
  for each row execute function public.on_submission_answer();

-- ------------------------------------------------------------------- access
alter table public.answer_tallies enable row level security;

drop policy if exists "answer tallies are public" on public.answer_tallies;
create policy "answer tallies are public" on public.answer_tallies
  for select to anon, authenticated using (true);

grant select on public.answer_tallies to anon, authenticated;

-- The trigger is the only writer. Supabase grants the full set to both roles on
-- a new table by default, which is what 20260727002000 exists to undo; a table
-- added later has to undo it too.
revoke insert, update, delete on public.answer_tallies from anon, authenticated;

alter publication supabase_realtime add table public.answer_tallies;
