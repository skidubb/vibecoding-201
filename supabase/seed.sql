-- The four polls, quoted from Vibecoding-201-Production-GTM-Tools-v6.pptx.
--
-- Wording is verbatim from the slides, including the option text. The room
-- will be looking at the deck and the site at the same time; a paraphrase on
-- one of them is a distraction at exactly the wrong moment.
--
-- Correct answers and debriefs live here and only here. They are withheld by a
-- column grant until the presenter moves a poll to 'revealed', so an attendee
-- reading the network tab during the forty-five seconds of a poll finds the
-- question and the options and nothing else.
--
-- Every poll ships 'closed'. Nothing is open until Scott opens it.

insert into public.polls (slug, question, scenario, state, correct_option_id, debrief, sort)
values
  (
    'cold-open',
    'Which one would you trust to run Monday''s retention meeting?',
    'Two identical screens. Screen A was built in 12 minutes on sample data behind an open link. Screen B stores real records, controls access, refreshes itself, and logs failures.',
    'closed',
    null,
    null,
    1
  ),
  (
    'debugging',
    'The first build works except for one repeatable error. What is the highest-leverage next move?',
    null,
    'closed',
    'debugging:c',
    'Debugging is delegation with evidence attached. A throws away the context that got you this far. B is tool-shopping instead of problem-solving. D is the trap that makes people believe they need to become engineers.',
    2
  ),
  (
    'proportionate-door',
    'A competitor publishes pricing on a public site with no API. Jordan needs a reviewed snapshot every Monday. Most proportionate starting approach?',
    null,
    'closed',
    'proportionate-door:b',
    'Automated is not the same as reliable: a browser workflow needs validation, change detection, and a human exception path. C is the planted distractor — you cannot build an API for someone else''s site.',
    3
  ),
  (
    'priya',
    'What is the right call?',
    'Priya, Head of Partnerships, built a partner deal-registration app in Lovable on Sunday. Sample data, no sign-in, looks fantastic. She wants to send the link to 40 partners on Monday.',
    'closed',
    'priya:c',
    'Current rung is Prototype. The binding constraints are persistence and identity. The next move is a three-line spec with a checkable Done, then a plan — not more polish, and not a rebuild.',
    4
  );

insert into public.poll_options (id, poll_slug, label, body, sort) values
  ('cold-open:a', 'cold-open', 'A', 'Screen A — built in 12 minutes. Sample data. Open link.', 1),
  ('cold-open:b', 'cold-open', 'B', 'Screen B — stores real records, controls access, refreshes itself, logs failures.', 2),

  ('debugging:a', 'debugging', 'A', 'Rewrite the original prompt', 1),
  ('debugging:b', 'debugging', 'B', 'Regenerate it in another platform', 2),
  ('debugging:c', 'debugging', 'C', 'Provide the error, reproduction steps, and expected behavior; ask the agent to diagnose and test a fix', 3),
  ('debugging:d', 'debugging', 'D', 'Read every line of code', 4),

  ('proportionate-door:a', 'proportionate-door', 'A', 'Hire someone to copy it every week', 1),
  ('proportionate-door:b', 'proportionate-door', 'B', 'Browser automation with validation and an exception path', 2),
  ('proportionate-door:c', 'proportionate-door', 'C', 'Build a custom API', 3),
  ('proportionate-door:d', 'proportionate-door', 'D', 'Assume an MCP connector exists', 4),

  ('priya:a', 'priya', 'A', 'Ship it; it is only 40 partners', 1),
  ('priya:b', 'priya', 'B', 'Polish the interface first', 2),
  ('priya:c', 'priya', 'C', 'Hold. It needs real storage, controlled access, and a review before anything external-facing ships', 3),
  ('priya:d', 'priya', 'D', 'Rebuild it from scratch in the terminal', 4);

-- Tally rows exist from the start so a poll renders a complete set of bars at
-- zero rather than growing rows in as the first votes arrive.
insert into public.poll_tallies (poll_slug, option_id, votes)
select poll_slug, id, 0 from public.poll_options;
