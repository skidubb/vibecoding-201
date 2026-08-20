# The pre-generated verdict

The fallback for the evaluation exercise. If your agent has not answered by the
time the clock runs out — or you have no agent connected yet — take this verdict
and keep moving: the spec exercise needs the three lines at the bottom, nothing
else. It came from the class's own agent, given the starter app and the
evaluation prompt pasted word for word.

Working on your own app, use this as the worked example of what a good answer
looks like: every line points at a file, and the verdict agrees with the scores
under it.

## The evaluation, item by item

Project: the starter app (`monday-gtm-dashboard/`).

- **Prototype, tool, or system:** Prototype. The CRM data is baked into
  `monday-gtm-dashboard-standalone.html` itself — sample inputs riding inside
  the code, which is the prototype definition regardless of how finished the
  five panels look.

- **Persistent data — not met.** There is no database. The extract lives inside
  the HTML file; nothing a user does survives anywhere.
- **Sign-in — not met.** No accounts exist. The file opens for anyone by
  double-click, which is a feature of the class and a gap of the tool.
- **Enforced authorization — not met.** Nothing decides who may see what,
  because there is no one to decide about.
- **Server-side secrets — met.** No credential values appear anywhere in the
  code, because nothing needs one yet. This item gets harder the day a database
  arrives.
- **A tested critical workflow — not met.** `verification/` holds scripts that
  check the numbers, but a person has to run them; no automated test runs the
  workflow on change.
- **Visible error states — met.** A blocked fetch shows a file picker instead of
  an error, and a bad extract says "The embedded extract failed to parse."
- **Logs and analytics — not met.** No run leaves a record anywhere.
- **Preview before production — not met.** Saving the file is shipping it.
- **A named owner — not met.** No name is on it.

## The three lines to paste

```text
Verdict: prototype
Evidence: the CRM data ships inside the HTML file itself — sample inputs baked into the code, with no database behind them.
First gap: persistent data — import the CSV into a real database the app reads, so records exist outside the file.
```

Two items met of nine, and the verdict says prototype: the score and the verdict
must agree. An answer that lists seven unmet items and still says "tool" has
classified the ambition rather than the code — send it back.
