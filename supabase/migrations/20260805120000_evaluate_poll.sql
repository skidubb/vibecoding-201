-- The evaluate poll, added for the Edit1 re-cut (2026-08-05).
--
-- The room runs the evaluation prompt from the kit against a project of their
-- own and votes the verdict their agent returned: prototype, tool, or system.
-- Option bodies are the observable tests from the deck's own table, so the
-- slide and the ballot say the same thing.
--
-- No correct answer and no debrief on purpose — the vote is a census of the
-- room's own projects, and every verdict is a true answer about somebody's
-- repository.
--
-- Idempotent, so re-applying is safe. Ships 'closed'; nothing is open until
-- Scott opens it.

insert into public.polls (slug, question, scenario, state, correct_option_id, debrief, sort)
values
  (
    'evaluate',
    'Is it a prototype, a tool, or a system?',
    'Run the evaluation prompt from the kit against a project you have already built, then vote the verdict your agent returned.',
    'closed',
    null,
    null,
    5
  )
on conflict (slug) do nothing;

insert into public.poll_options (id, poll_slug, label, body, sort) values
  ('evaluate:prototype', 'evaluate', 'A', 'Prototype — demonstrates the idea with sample or temporary inputs. It changes belief.', 1),
  ('evaluate:tool', 'evaluate', 'B', 'Tool — a defined group reliably completes a real workflow. It changes the work.', 2),
  ('evaluate:system', 'evaluate', 'C', 'System — runs across teams, data sources, permissions, time, and failure. It changes the business.', 3)
on conflict (id) do nothing;

insert into public.poll_tallies (poll_slug, option_id, votes)
select poll_slug, id, 0 from public.poll_options where poll_slug = 'evaluate'
on conflict (poll_slug, option_id) do nothing;
