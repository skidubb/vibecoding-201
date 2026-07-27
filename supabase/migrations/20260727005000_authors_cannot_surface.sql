-- An author may not put their own submission on the room's screen.
--
-- `surfaced_at` is the column the deck reads to decide what to render to
-- everyone, and the author's own UPDATE policy placed no restriction on which
-- columns they could write. Setting it on their own row was a legal edit, so
-- any attendee could push their own text onto the projected screen and onto
-- every other attendee's device without the presenter touching anything. In a
-- room of a hundred and fifty that is not a hypothetical.
--
-- The check constraint added with the table only ever enforced *ordering* —
-- surfaced implies shared. It says nothing about who may do the surfacing, and
-- that was the half being relied on by mistake.
--
-- Found against production by `npm run smoke`, not by a local rebuild and not
-- by the SQL suite, which had only ever asked whether an admin could surface
-- something private. It could not. Nobody had asked whether an author could.
--
-- Withdrawal still works, and has to: taking a submission down sets
-- `surfaced_at` back to null, which this check permits. What it forbids is an
-- author leaving their own row in the on-screen state. The admin policy is
-- untouched and still the only way in, because policies for one command are
-- OR'd — an admin surfacing a shared submission passes on their own policy.
--
-- One consequence worth knowing on stage: while a submission is on screen its
-- author can no longer edit its body, because any update they make would have
-- to leave `surfaced_at` set. They can still take it down. Reading out a spec
-- that is being rewritten underneath you is not a feature.

drop policy "authors edit their own submissions" on public.submissions;

create policy "authors edit their own submissions" on public.submissions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and surfaced_at is null);
