-- Vibecoding 201 companion — initial schema.
--
-- This file is an exhibit as much as it is plumbing. Slide 21 tells the room
-- that hiding records in the interface is not security, and slide 39 puts
-- "enforced authorization" on the production standard, so the rules here are
-- the ones the class is about to be told to demand. Read it that way.
--
-- Four decisions worth stating before the DDL:
--
--   1. A poll's correct answer never leaves the database until the presenter
--      reveals it. Not hidden in the client and styled out — withheld by a
--      column grant, so reading it early returns "permission denied" rather
--      than a value.
--   2. Broadcasting a tally can never fail a vote. The notify path is wrapped;
--      if Realtime is down, the row still commits and the count still moves on
--      the next read.
--   3. One vote per signed-in account, enforced by a primary key. Not one vote
--      per person — accounts are free when anonymous sign-in is on, and the
--      copy on the page says "account" for that reason.
--   4. An administrator cannot publish a submission its author kept private.
--      "Private by default" is a rule here, not a default in a form.

-- ---------------------------------------------------------------- extensions
create extension if not exists pgcrypto with schema extensions;

-- ------------------------------------------------------------------- profiles
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text,
  display_name text,
  -- Consent, captured once, revocable by the owner. The only marketing-shaped
  -- column in the schema, and it is opt-in.
  wants_kit    boolean not null default false,
  created_at   timestamptz not null default now()
);

comment on table public.profiles is
  'One row per signed-in account, created by a trigger on auth.users.';

-- Admin identity lives in its own table with RLS enabled and no policies, so
-- nothing but a definer function can read it. A boolean on profiles would be
-- one careless policy away from letting the room promote itself.
create table public.app_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- ---------------------------------------------------------------------- polls
create type public.poll_state as enum ('closed', 'open', 'revealed');

create table public.polls (
  slug              text primary key,
  question          text not null,
  scenario          text,
  state             public.poll_state not null default 'closed',
  -- Withheld by column grant until state = 'revealed'. See the grants below.
  correct_option_id text,
  debrief           text,
  -- Insurance against the presenter forgetting, or losing connectivity mid-class.
  auto_close_at     timestamptz,
  sort              int not null default 0
);

create table public.poll_options (
  id        text primary key,
  poll_slug text not null references public.polls (slug) on delete cascade,
  label     text not null,
  body      text not null,
  sort      int not null default 0
);

create index poll_options_poll_slug_idx on public.poll_options (poll_slug, sort);

create table public.votes (
  poll_slug  text not null references public.polls (slug) on delete cascade,
  option_id  text not null references public.poll_options (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (poll_slug, user_id)
);

-- Aggregates, maintained by trigger. Readable by everyone including anonymous
-- visitors, so someone opening the link a month later sees what the room
-- answered. Individual votes are not readable that way — see the policies.
create table public.poll_tallies (
  poll_slug text not null references public.polls (slug) on delete cascade,
  option_id text not null references public.poll_options (id) on delete cascade,
  votes     int not null default 0,
  primary key (poll_slug, option_id)
);

-- ---------------------------------------------------------------- submissions
create table public.submissions (
  id          bigint generated always as identity primary key,
  exercise_id text not null,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  body        text not null,
  -- Set by the AUTHOR to offer their work to the room.
  shared_at   timestamptz,
  -- Set by an admin to actually put it on screen. Legal only where the author
  -- has already set shared_at; enforced by a check below, not by the UI.
  surfaced_at timestamptz,
  created_at  timestamptz not null default now(),
  unique (exercise_id, user_id),
  constraint surfaced_requires_author_consent
    check (surfaced_at is null or shared_at is not null)
);

-- --------------------------------------------------------------------- events
create table public.events (
  id         bigint generated always as identity primary key,
  name       text not null,
  section_id text,
  user_id    uuid references public.profiles (id) on delete set null,
  props      jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index events_created_at_idx on public.events (created_at desc);

-- ------------------------------------------------------------------ functions

-- SECURITY DEFINER everywhere, and every one pins search_path to '' so a
-- caller cannot shadow a table name and have the function operate on theirs.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.app_admins a where a.user_id = (select auth.uid())
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Tally maintenance plus best-effort broadcast.
--
-- The broadcast is wrapped deliberately. realtime.send can raise — a bad
-- config, a rate limit, a transient error in the realtime schema — and this
-- trigger runs inside the voter's transaction. Unwrapped, a broadcast failure
-- would roll back the INSERT and lose a vote that the attendee believes they
-- cast. A missed broadcast costs one stale bar chart until the next read; a
-- rolled-back vote costs the count itself.
create or replace function public.on_vote_inserted()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.poll_tallies (poll_slug, option_id, votes)
  values (new.poll_slug, new.option_id, 1)
  on conflict (poll_slug, option_id)
  do update set votes = public.poll_tallies.votes + 1;

  begin
    perform realtime.send(
      jsonb_build_object('poll_slug', new.poll_slug),
      'tally',
      'poll:' || new.poll_slug,
      false
    );
  exception when others then
    null;
  end;

  return new;
end;
$$;

create trigger votes_tally
  after insert on public.votes
  for each row execute function public.on_vote_inserted();

-- Casting a vote. A function rather than a bare INSERT so the "is this poll
-- open" check cannot be skipped, and so the caller gets a status it can render
-- instead of a Postgres error code it has to translate.
create or replace function public.cast_vote(p_poll_slug text, p_option_id text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_state public.poll_state;
begin
  if v_user is null then
    return 'not_signed_in';
  end if;

  select p.state into v_state
  from public.polls p
  where p.slug = p_poll_slug
    and (p.auto_close_at is null or p.auto_close_at > now());

  if v_state is null then return 'unknown_poll'; end if;
  if v_state <> 'open' then return 'poll_closed'; end if;

  if not exists (
    select 1 from public.poll_options o
    where o.id = p_option_id and o.poll_slug = p_poll_slug
  ) then
    return 'unknown_option';
  end if;

  insert into public.votes (poll_slug, option_id, user_id)
  values (p_poll_slug, p_option_id, v_user);

  return 'ok';
exception
  when unique_violation then
    return 'already_voted';
end;
$$;

-- The reveal, and the only route by which a correct answer reaches a browser.
-- Returns nothing at all until the presenter has moved the poll to 'revealed'.
create or replace function public.poll_reveal(p_poll_slug text)
returns table (correct_option_id text, debrief text)
language sql
security definer
set search_path = ''
stable
as $$
  select p.correct_option_id, p.debrief
  from public.polls p
  where p.slug = p_poll_slug and p.state = 'revealed';
$$;

-- The public event tail. A definer function because `events` itself is not
-- readable: this returns what happened without ever returning who did it.
create or replace function public.recent_events(p_limit int default 12)
returns table (name text, section_id text, created_at timestamptz)
language sql
security definer
set search_path = ''
stable
as $$
  select e.name, e.section_id, e.created_at
  from public.events e
  order by e.created_at desc
  limit least(greatest(p_limit, 1), 50);
$$;

-- ----------------------------------------------------------------------- RLS
alter table public.profiles     enable row level security;
alter table public.app_admins   enable row level security;
alter table public.polls        enable row level security;
alter table public.poll_options enable row level security;
alter table public.votes        enable row level security;
alter table public.poll_tallies enable row level security;
alter table public.submissions  enable row level security;
alter table public.events       enable row level security;

-- app_admins: RLS on, zero policies. Nothing reads it but is_admin().

-- auth.uid() is wrapped in a scalar subquery throughout so the planner
-- evaluates it once per statement rather than once per row.

create policy "own profile is readable" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "own profile is editable" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "polls are public" on public.polls
  for select to anon, authenticated using (true);
create policy "admins run the polls" on public.polls
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "options are public" on public.poll_options
  for select to anon, authenticated using (true);

create policy "tallies are public" on public.poll_tallies
  for select to anon, authenticated using (true);

-- A voter may read their own vote and nothing else. This is the cross-tenant
-- test from slide 21, runnable against data the room just created: sign in as
-- one attendee, ask for another's row, get an empty set.
create policy "own vote is readable" on public.votes
  for select to authenticated using (user_id = (select auth.uid()));

-- No insert policy on votes: cast_vote() is the only way in.

create policy "own submissions are readable" on public.submissions
  for select to authenticated using (user_id = (select auth.uid()));
create policy "surfaced submissions are readable" on public.submissions
  for select to authenticated using (surfaced_at is not null);
create policy "authors write their own submissions" on public.submissions
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "authors edit their own submissions" on public.submissions
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
-- An admin sees a submission only once its author has shared it, and may only
-- surface what they can see. Both halves matter, and the SELECT half is not
-- redundant: Postgres applies SELECT policies to the rows an UPDATE reads, so
-- without it an admin could see nothing to moderate and the update silently
-- affected zero rows. A private submission is not merely un-publishable by an
-- admin — it is invisible to them.
create policy "admins read what authors shared" on public.submissions
  for select to authenticated
  using ((select public.is_admin()) and shared_at is not null);

create policy "admins surface what authors shared" on public.submissions
  for update to authenticated
  using ((select public.is_admin()) and shared_at is not null)
  with check ((select public.is_admin()) and shared_at is not null);

create policy "anyone may log an event" on public.events
  for insert to anon, authenticated with check (true);
create policy "only admins read raw events" on public.events
  for select to authenticated using ((select public.is_admin()));

-- --------------------------------------------------------------------- grants
--
-- Stated explicitly rather than inherited. A Supabase project grants new public
-- tables to anon and authenticated by default, so leaving this out appears to
-- work — until the schema is rebuilt somewhere that default is not configured,
-- and every policy starts returning "permission denied" for reasons no policy
-- explains. A migration that only runs correctly inside one project's ambient
-- settings is not a migration you can hand to anyone.
grant usage on schema public to anon, authenticated;

grant select, update on public.profiles     to authenticated;
grant select          on public.poll_options to anon, authenticated;
grant select          on public.poll_tallies to anon, authenticated;
grant select          on public.votes        to authenticated;
grant update          on public.polls        to authenticated;
grant select, insert, update on public.submissions to authenticated;
grant insert          on public.events       to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;

-- The correct answer and the debrief are withheld at the column level. RLS
-- filters rows; only a grant can withhold a field of a row that is otherwise
-- public, and the question and state have to stay readable for the poll to
-- render at all. poll_reveal() is the sanctioned way through.
grant select (slug, question, scenario, state, auto_close_at, sort)
  on public.polls to anon, authenticated;

-- Same shape for events: the tail is public, the identity behind it is not.
grant select (id, name, section_id, created_at) on public.events to authenticated;

-- ------------------------------------------------------------------- realtime
alter publication supabase_realtime add table public.poll_tallies;
alter publication supabase_realtime add table public.polls;

-- Integrity readout for the presenter.
--
-- One vote per account is enforced by the primary key on votes, but accounts
-- are free while anonymous sign-in is on, so the honest claim is "per account"
-- and the honest safeguard is being able to see when someone tests it. This
-- returns totals only — never who — and is admin-only, so it cannot become a
-- side channel onto individual votes.
create or replace function public.poll_integrity(p_poll_slug text)
returns table (total_votes bigint, distinct_accounts bigint, new_accounts_60s bigint)
language sql
security definer
set search_path = ''
stable
as $$
  select
    count(*)::bigint,
    count(distinct v.user_id)::bigint,
    count(*) filter (where v.created_at > now() - interval '60 seconds')::bigint
  from public.votes v
  where v.poll_slug = p_poll_slug
    and (select public.is_admin());
$$;
