-- The presenter console: a second admin address, the backfill the trigger
-- never ran, and the one read model the console needs.

-- Scott presents from either account.
insert into public.admin_emails (email) values ('scott@cardinalelement.com')
on conflict do nothing;

-- Promotion happens inside handle_new_user(), which fires on the FIRST insert
-- into auth.users only — so an account that signed in before 20260727004000
-- landed was never promoted, and the presenter bar silently never appears for
-- it. Backfill from the accounts that already exist. Runs as the migration
-- role, which can read auth.users; anonymous accounts have a null email and
-- can never match. Idempotent: re-applying inserts nothing new.
insert into public.app_admins (user_id)
select u.id
from auth.users u
join public.admin_emails e on lower(e.email) = lower(u.email)
on conflict (user_id) do nothing;

-- Grouped event counts for the console's analytics panel. Same posture as
-- 20260727006000: SECURITY DEFINER with is_admin() asked in the body, so the
-- gate travels with the data. Grouped in the database because the raw table
-- grows for the whole class — the console should not download thousands of
-- rows to add them up.
create or replace function public.admin_event_counts()
returns table (name text, section_id text, n bigint)
language sql
security definer
set search_path = ''
stable
as $$
  select e.name, e.section_id, count(*)::bigint
  from public.events e
  where (select public.is_admin())
  group by e.name, e.section_id
  order by count(*) desc, e.name;
$$;

grant execute on function public.admin_event_counts() to authenticated;
