# AGENTS.md

Rules for a coding agent working on the Monday GTM Dashboard. Copy this file to
`CLAUDE.md` as well: Claude Code reads that name, Codex and several others read this
one, and the contents are the same.

The rules that apply to any repository are in the kit's `agent-instructions.md` — plan
before changing anything, one bounded capability at a time, never commit to main, never
claim something works without running it. What follows is what is specific to this app.

## Read first

`PRODUCT.md` for what this is for and what it refuses to do. `ARCHITECTURE.md` for why
it is one file. `DATA_MODEL.md` for what each column means and what may be done with it.

## How to run it, and the gate

```bash
open monday-gtm-dashboard-standalone.html   # every panel renders, network off

python3 verification/verify_real.py         # ground truth from the CSV, in pandas
python3 -m http.server 8899 &
node verification/browsercheck.js           # the gate
```

`browsercheck.js` loads the page in headless Chromium, pulls the app's own computed
values out of the metrics module, and compares each one against the pandas result. A
change that moves a number while this still passes has not been tested.

The `verification/` folder ships with the app's repository, not inside the standalone
HTML download. Working from the download alone, the gate is the app's own on-screen
verification panel, and this section is the shape your own repo's gate should take.

## Never

- **Never edit the embedded extract.** The `inlinedata` block is source data. When a
  number looks wrong, the reading is wrong before the data is.
- **Never define a metric at a call site.** Win rate, revenue, realization, days
  untouched and cycle length live in `const M`. That rule is what stops two panels
  disagreeing in front of a room.
- **Never report `Total_Amount` as revenue.** It is pre-discount. Revenue is
  `Final_Amount` on won rows.
- **Never add a build step, a bundler, or a package dependency.** The file that is edited
  has to stay the file that opens.
- **Never match a CSV column by position.** Match by name, case-insensitively.
- **Never print an aggregate without the row count behind it.**
- **Never invent a column.** A plan that names a field absent from `DATA_MODEL.md`
  invented it, and that invention becomes the owner's to defend.

## When something is missing

Say so on screen. Blank is not zero, an absent date is not today, and a panel with no
rows explains why it has none.

## Known limitations

Week-over-week deltas cannot come from one extract, and the panels say "no prior
snapshot" instead of guessing. Closed history stops 31 December 2025, so any panel
written as "last 90 days" against closed deals returns nothing.
