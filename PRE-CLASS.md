# Pre-class checklist

Run this the morning of, not the night before — a Supabase project that was
awake at 9pm can be paused by 9am, and the failure looks exactly like a broken
site to a room of a hundred and fifty people.

Times are for the checks themselves. Budget 30 minutes for the whole list so
there is room for something to be wrong.

## The three gates, in order

```bash
cd crossing-the-gap-site
npm run build     # types compile
npm test          # 39 specs, backend-off — also rehearses the kill switch
npm run smoke     # the live project: RLS, votes, submissions, the export gate
npm run links     # every outbound URL in the deck still resolves
```

`npm test` builds and starts its own server on 3100 and never reuses one. If it
produces flaky failures that pass in isolation, look for a stray `next start` —
a second server starves the five workers.

`npm run smoke` needs `.env.local`. It writes only to the `rehearsal` poll and
to `exercise_id = 'smoke'`, neither of which the deck renders.

## The database

- [ ] **Supabase project is awake.** Free projects pause after a week idle.
      Open the dashboard and confirm, or just run `npm run smoke` — it fails
      loudly if the project is asleep.
- [ ] **Consider Pro for the class month.** 150 clients on the realtime channel
      is roughly 151 messages/second at the moment a poll reveals, against a
      100/s cap on free. The tallies would lag, not break, but they would lag
      in front of the room.
- [ ] **Every class poll is `closed` and its tally is zero.** `npm run smoke`
      asserts the first half. For the second:
      `select poll_slug, sum(votes) from poll_tallies group by 1;`
- [ ] **Presenter role confirmed.** Sign in as scott.e.ewalt@gmail.com, land on
      a poll section, and check the bar appears bottom-right. It is granted by
      `admin_emails`, so a different Google account gets nothing.

## The room's side

- [ ] **Open `/vote` on a phone**, on cellular, not the office wifi. This is the
      link that goes in Zoom chat and it is the one thing no synthetic test
      covers — OAuth blocks and the anonymous rate cap are both invisible to a
      script running on your laptop.
- [ ] **Sign in anonymously from a private window** and cast one vote on the
      rehearsal poll, then confirm the tally moved.
- [ ] **`/kit` loads and one file downloads.**

## The two live moments

- [ ] **Cold open.** Shift-O opens it, the two screens render, a vote lands,
      Shift-R reveals. Then Shift-C and reset the tally before class:
      `delete from votes where poll_slug = 'cold-open';`
- [ ] **Spec exercise.** From a second browser signed in as somebody else:
      write a spec, submit, and *do not* share it. Confirm your presenter panel
      (Shift-S) shows nothing. Then share it and confirm it appears. Then put it
      on screen and confirm it renders in the section for everyone.

      This is the one check with no automated equivalent — smoke proves the
      database refuses, but only a second browser proves the panel draws it.

## Things that have bitten before

- The deck's presenter keys are arrows and space. Space is kept by a focused
  control, so click empty page before presenting if you have been clicking
  around.
- Screenshot at 1080p before believing a layout is fine. Every visual defect
  worth fixing on this site was found by looking, not by a test.
- The kill switch is `NEXT_PUBLIC_BACKEND_DISABLED=1`. It is exercised on every
  `npm test` run rather than being a flag nobody has ever set. If the backend
  is having a bad day mid-class, this is the lever — but it needs a redeploy,
  so decide before you start, not during.
