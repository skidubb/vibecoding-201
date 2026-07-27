-- A poll that exists only to be voted in.
--
-- The four class polls ship closed and must stay that way until Scott opens
-- them on the day: rehearsing against one leaves real-looking votes in the
-- tally the room will see. This one is open permanently, is not rendered by
-- any section, and is the target for every end-to-end check — a preview
-- deployment, a smoke test after a deploy, or a nervous rehearsal at 3am.
--
-- Delete its votes freely. Nothing points at them.

insert into public.polls (slug, question, scenario, state, correct_option_id, debrief, sort)
values (
  'rehearsal',
  'Rehearsal only. Does the vote path work end to end?',
  'Not shown in the deck. Vote here to check the whole chain: sign-in, the open check, the primary key, the tally trigger, and the broadcast.',
  'open',
  'rehearsal:b',
  'If you are reading this, reveal works too.',
  99
) on conflict (slug) do nothing;

insert into public.poll_options (id, poll_slug, label, body, sort) values
  ('rehearsal:a', 'rehearsal', 'A', 'No', 1),
  ('rehearsal:b', 'rehearsal', 'B', 'Yes', 2)
on conflict (id) do nothing;

insert into public.poll_tallies (poll_slug, option_id, votes)
select 'rehearsal', id, 0 from public.poll_options where poll_slug = 'rehearsal'
on conflict (poll_slug, option_id) do nothing;
