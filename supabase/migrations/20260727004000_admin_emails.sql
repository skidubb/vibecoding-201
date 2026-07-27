-- Who becomes the presenter, decided before they ever sign in.
--
-- app_admins is keyed on a user id, which does not exist until someone
-- authenticates — so without this, granting the presenter role means waiting
-- for Scott to sign in and then running SQL against production, on the day,
-- possibly minutes before the class. This lets the decision be made in a
-- migration and reviewed in a diff.
--
-- Kept in its own table with RLS on and no policies, exactly like app_admins.
-- Nothing but the definer trigger reads it, so an attendee cannot enumerate
-- who is allowed to run the room, or discover that adding their own address
-- would be enough.

create table public.admin_emails (
  email text primary key
);

alter table public.admin_emails enable row level security;

insert into public.admin_emails (email) values ('scott.e.ewalt@gmail.com')
on conflict do nothing;

-- Fold the promotion into the existing new-user trigger. An anonymous sign-in
-- has no email, so it can never match and can never self-promote.
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

  if new.email is not null and exists (
    select 1 from public.admin_emails e where lower(e.email) = lower(new.email)
  ) then
    insert into public.app_admins (user_id) values (new.id)
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;
