# PRODUCT.md

## What this is

The Monday GTM Dashboard. One screen a GTM leader opens before a 9am pipeline call,
built from a CRM extract of 10,000 deals dated 4 August 2026.

```text
Job:  Every Monday, see what is closing, what has gone quiet, and where the book is
      leaking money, with the row count behind every number.
User: A VP of RevOps or a sales leader reading their own book. Nobody signs in and
      nobody edits anything.
Done: Open the file by double-click with the network off, set Territory to West, copy
      the view link, open that link in another browser, and get the same filtered screen.
```

## What it answers

- **Closing this month** — open deals with an expected close inside the horizon, and the
  ones that already slipped past it.
- **Went quiet** — open pipeline by days since last activity, sorted by dollars at risk
  rather than by age.
- **Discount leakage** — win rate by discount band on closed deals.
- **Where we lose, and to whom** — closed deals by competitor, including no-decision.
- **Rep said vs buyer said** — closed-lost deals where a buyer interview exists and
  disagrees with the reason the rep logged.

## What it deliberately does not do

- **No week-over-week deltas.** They need a snapshot table, and this is one extract taken
  at one moment. The panels say "no prior snapshot" instead of showing a number nobody
  can defend.
- **No pipeline weighted by `Win_Probability`.** That column is a lookup off
  `Deal_Stage` with zero variance inside any stage, so weighting by it restates the stage
  mix with a dollar sign attached.
- **No slicing by `Company_Size`.** In this CRM data it is independent of
  `Customer_Segment`, so a cut by it carries no information.
- **No writes.** Nothing done on the screen changes any record anywhere.
- **No sign-in.** Read `SECURITY.md` before hosting it.

## Still needed from the leader

Quarterly target by territory, for coverage and attainment. The dollar floor for the
went-quiet list. The fiscal calendar, if it differs from the calendar quarters in the
CRM data. Whether the Monday view defaults to the whole book or to one territory.
