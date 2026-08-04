-- The job menu becomes a choice between two apps.
--
-- Scott's 2026-08-04 ruling: attendees are either working with the starter app
-- (the Monday GTM dashboard shipped in the kit) or with an app they brought.
-- `profiles.job` now stores which of those two, written through the same
-- `set_job()` door.
--
-- The six original values stay legal in the column constraint because rows
-- holding them already exist and a constraint has to pass for every existing
-- row. They are removed from `set_job()` instead: nothing can pick them any
-- more, and the rows that carry one keep meaning what they meant when they
-- were written.

alter table public.profiles
  drop constraint if exists profiles_job_is_known;

alter table public.profiles
  add constraint profiles_job_is_known check (
    job is null or job in
      ('starter', 'own',
       'identify', 'reconcile', 'route', 'prepare', 'summarize', 'approve')
  );

comment on column public.profiles.job is
  'Which app this attendee is building behind: the starter app from the kit '
  '(starter) or the one they brought (own). The six legacy job values remain '
  'readable on rows written before 2026-08-04.';

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

  if p_job is not null and p_job not in ('starter', 'own') then
    return 'unknown-job';
  end if;

  update public.profiles set job = p_job where id = auth.uid();

  if not found then
    return 'no-profile';
  end if;

  return 'ok';
end;
$$;
