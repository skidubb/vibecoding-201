# OWNERSHIP

Slide 34 of the deck argues that a tool only one person understands does not have an owner,
it has a hostage. This file is that slide applied to this repository. Six items, and the
ones still undecided say so instead of sitting blank.

## Named owner

**Scott Ewalt, Cardinal Element. scott@cardinalelement.com**

Owns the content, the deploy, and the decision to keep or retire the site.

## Backup owner

**None today.** The decision Scott needs to make is written as a comment in the source of
this file.

<!-- DECIDE: backup owner.

This is the one item on the slide-34 list that cannot be resolved by writing something down.

The deck's speaker notes reference a Pavilion producer ("Larissa launches") for poll handling
during class. Naming that person here would commit someone outside Cardinal Element to an
on-call role on Scott's repository. That is Scott's call to make and theirs to accept, so no
name is filled in.

Three options, in descending order of how real the role would be:

1. Ask the Pavilion producer, and if they accept, give them Vercel project access so the role
   is real rather than ceremonial. A backup owner who cannot reach the dashboard cannot roll
   anything back.
2. Name a second person at Cardinal Element who already has Vercel access.
3. Accept single-owner risk explicitly and record why: the site is a companion, the PPTX is
   the fallback, and an outage during class is survivable. This is a legitimate answer, but
   it has to be the written answer rather than the default one.

Until this is resolved, the honest status is the one rendered above: no backup owner. -->

## Rollback path

Production is the Vercel project `crossing-the-gap-site`
(`prj_TDu9f19NqNIkx6JKnjE0BfB0nNZ3`, team `team_wsKqBJYP74amzLTANoYe2tW7`), serving
<https://crossing-the-gap-site.vercel.app>.

Vercel retains prior production deployments and can repoint the domain at one of them
without a rebuild.

```bash
vercel rollback [deployment-id or url]   # repoint production at a previous deployment
vercel rollback status                   # check a pending rollback
vercel promote [deployment-id or url]    # undo a rollback and resume normal deploys
```

The same thing is available in the dashboard from the Production Deployment tile on the
project overview, or the ⋮ menu on any row in the Deployments tab.

Three properties worth knowing before you need them:

- **Only deployments that were once live on the production domain are eligible.** Preview
  deployments are not, so a preview URL is not a rollback target.
- **Rolling back turns off auto-assignment of the production domain.** Pushes stop going
  live until someone runs `vercel promote`. A rollback nobody undoes looks exactly like a
  deploy pipeline that has quietly stopped working.
- **Environment variables do not roll back with the code.** The restored build runs against
  whatever variables are current.

<!-- UNVERIFIED: on the Hobby plan, rollback reaches only the immediately previous production
deployment; Pro and Enterprise reach any eligible one. I could not check which plan
team_wsKqBJYP74amzLTANoYe2tW7 is on. Confirm before relying on reaching further back than one
deployment. -->

## Known limitations

Verified against the repository as it stands, not inferred from the plan.

- **The backend is real and load-bearing.** Supabase Postgres (eight migrations), Google +
  anonymous auth, live polls, the spec exercise, an events log, the `/admin` presenter
  console, and the `/admin/export` CSV route. All forty sections of
  `Vibecoding-201-Production-GTM-Tools-v6.pptx` are on the page, titles verbatim, and
  production deploys from `main` via Git. Shutting the site down now also means deciding
  what happens to the Supabase project and the data in it — see the shutdown DECIDE block.
- **The progress rail disappears below the `md` breakpoint** (`ProgressRail.tsx:39`). On a
  phone there is no position readout and no chapter navigation.
- **Two of slide 18's six harness files are absent:** `DATA_MODEL.md` and `SECURITY.md`.
  The schema they would describe now exists in `supabase/migrations/`, so this is a real
  gap rather than a deferral;
  see the closing section of `ARCHITECTURE.md`. An attendee counting files will still come
  up two short, so the reason is written down rather than left to inference.
- **`CLAUDE.md` still says "There is no test or lint script."** There is a test script,
  added alongside the Playwright suite. `README.md` has been corrected; `CLAUDE.md` line 12
  has not.
- **The Playwright suite covers presenter mechanics only, in Chromium only.** Nothing asserts
  that a section reads correctly, and no second browser is exercised.
- **No accessibility audit has been done.** On a keyboard-driven site, that is the gap most
  likely to matter.

## Review date

**Proposed, not agreed.** Two reviews, because they answer different questions. Details in
the comment below.

<!-- DECIDE: review dates.

1. The week before the class. Confirm production matches `main`, click through all twelve
   sections in both themes, and run `npm test`. This is a go/no-go check rather than a
   review.
2. Thirty days after the class. Decide whether the site keeps existing. By then Scott knows
   whether anyone opened the link who was not in the room, which is the only evidence that
   separates a companion artifact from a deck nobody needed.

Set real dates once the class date is fixed. A review date nobody put in a calendar is a
known limitation wearing a nicer label. -->

## Shutdown path

**Proposed, not agreed.** Retiring this site is cheap, which is the argument for deciding
now rather than letting it drift into being permanently half-maintained.

<!-- DECIDE: shutdown.

1. Export nothing. There is no user data, no database, and no submitted content. This is the
   payoff of the no-backend non-goal in `SPEC.md`.
2. Keep the repository. It is the artifact the class points at, and it costs nothing.
3. Either delete the Vercel project, or leave it deployed with a banner naming the class date
   and saying the content is archived. A live page with a stale deck and no date on it is the
   worse of the two outcomes.
4. If the URL was shared in Pavilion's Member Hub, tell the Learn team before it stops
   resolving.

The decision Scott owes this file: archived and left up, or taken down? Pick one and put a
date next to it. -->
