-- Read models for the post-class export.
--
-- Every one is SECURITY DEFINER and every one gates on is_admin() in its own
-- body, so the gate travels with the data rather than living in a route
-- handler. A URL is not a permission.
--
-- These exist because row-level security correctly refuses the presenter the
-- rows an export needs: `profiles` is readable only by its owner, so nobody —
-- admin included — can read the room's email addresses through the table. That
-- is the right default, and the export is the one deliberate, audited hole in
-- it rather than a policy loosened everywhere.

-- Poll results, with the option text so a CSV reads without a join.
create or replace function public.admin_poll_results()
returns table (poll_slug text, option_id text, label text, body text, votes int)
language sql
security definer
set search_path = ''
stable
as $$
  select t.poll_slug, t.option_id, o.label, o.body, t.votes
  from public.poll_tallies t
  join public.poll_options o on o.id = t.option_id
  where (select public.is_admin())
  order by t.poll_slug, o.sort;
$$;

-- Submissions the room chose to share, and only those.
--
-- Deliberately not every row. The class spends an hour arguing that an author's
-- consent is what moves their work, and an export that quietly swept up the
-- specs people wrote and kept private would be the same betrayal the check
-- constraint exists to prevent — just later, and in a spreadsheet. No user_id
-- either: what is useful afterwards is the writing, not who wrote it.
create or replace function public.admin_submissions()
returns table (exercise_id text, body text, shared_at timestamptz, surfaced_at timestamptz)
language sql
security definer
set search_path = ''
stable
as $$
  select s.exercise_id, s.body, s.shared_at, s.surfaced_at
  from public.submissions s
  where (select public.is_admin())
    and s.shared_at is not null
  order by s.id;
$$;

-- The one place an email legitimately appears, and only where its owner opted in.
create or replace function public.admin_kit_requests()
returns table (email text, display_name text, created_at timestamptz)
language sql
security definer
set search_path = ''
stable
as $$
  select p.email, p.display_name, p.created_at
  from public.profiles p
  where (select public.is_admin())
    and p.wants_kit
    and p.email is not null
  order by p.created_at;
$$;

grant execute on function public.admin_poll_results()  to authenticated;
grant execute on function public.admin_submissions()   to authenticated;
grant execute on function public.admin_kit_requests()  to authenticated;
