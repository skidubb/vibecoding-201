# The no-account path

Every exercise in the class hour, with nothing installed and no accounts. If Supabase
will not connect, IT will not approve Docker, or you have no coding agent yet, this
path is the class — not a consolation for missing it. What the hour tests is a
checkable Done, a counted plan, a database that refuses you, and nine checks you can
run. All of that is learnable with a browser and whatever assistant you already have.

## What you need

- Any assistant you already use. The chat window is enough.
- The 200-row sample: <https://storage.googleapis.com/vibecoding-201-data/sample-200.csv>
- The class link, during the session, for the polls and the security test.

If your workspace answers that link with a 403, the block is the workspace's, not
the file's. Open the link in your own browser, then paste or attach the sample.

## The five exercises

### 1. Write your spec — 8 minutes

Three lines, by hand: Job, User, Done. `prompt-pack.md` opens with this. No tool is
involved; this exercise was never going to touch one.

### 2. Run your Done — 2 minutes

Paste the sample into your assistant with:

> Here are 200 CRM rows. Follow these steps exactly and tell me how many rows they
> return: [your Done, written as steps].

The sample is smaller than the full set, so your number is smaller. The check is the
same check:

| Job | Full set returns | The 200-row sample returns |
| --- | --- | --- |
| 1 Identify | 634, plus 200 with no activity date | **15**, plus **4** with no activity date |
| 2 Reconcile | 866 of 2,479 closed-lost | **20** of **55** closed-lost |
| 3 Route | 1,463 | **31** |
| 4 Prepare (East) | 148 rows, $19,392,867 | **2** rows, **$126,666** |
| 5 Summarize | Rep-20: 63 closed-lost | **Rep-33: 4** (Rep-20 has none in the sample) |
| 6 Approve | 2,248 | **42** |

A different number means your Done asks a different question. That difference is the
exercise, not a mistake.

### 3. Fire the plan prompt — 3 minutes

Same chat. Paste the plan prompt from `prompt-pack.md` (number 2, word for word) above
your spec. "The current project" is the sample you already pasted. If nothing usable
comes back before the clock does, take `pregenerated-plan.md` and go straight to the
count.

### 4. Count what the plan invented — 2 minutes

Open `schema.md` beside the plan. Everything the plan names that the 36 columns do
not contain is an invention. Submit the count. A zero usually means you did not look
hard enough.

### 5. Run the security test — 2 minutes

This one was never yours to install. It runs against the class's own live database at
the class link: sign in as a guest, request a record from your organisation, then
request one from Organization B, and watch the database refuse the second request.

## What success is on this path

Four numbers you can defend: the rows your Done returned, the inventions you counted,
the refusal the database handed you, and how many of the nine checks a tool you
already use passes. That is the class, complete. Your own stack makes it real later;
it was never what the hour was testing.

## The homework on this path

"Ship one narrow internal tool" assumes accounts that connect. Until yours do, bring:

1. **Your three-line spec.** Unchanged from the standard homework.
2. **Your plan, with its invention count** — in place of the live link.
3. **The nine checks scored against a tool your team already depends on**, plus one
   known limitation of that tool you found by actually checking it.

Those three prove the same thing the link proves: that you can direct the work and
verify it. The link comes the week your accounts do.
