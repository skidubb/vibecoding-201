# The pre-generated spec

The fallback for the spec exercise. If the spec prompt has not come back by the
time the clock runs out — or you have no agent connected yet — take this spec and
fire the plan prompt above it. It came from the class's own agent, given the
starter app, the pre-generated verdict, and the spec prompt pasted word for word,
with the first gap chosen as the feature.

Working on your own app, use it as the shape to imitate: three lines, four
constraints, and every line either points at something the project contains or
says "assumed."

## The candidates the agent proposed

1. **Persistent data for the quiet-deals list** — the evaluation's first gap:
   import the CSV into a real database the app reads.
2. A saved view for one territory's quiet pipeline, from the panel that already
   filters by territory.
3. An export of the rep-versus-buyer disagreement rows, from the panel that
   already draws them.

The class works candidate 1.

## The spec

```text
Job:  Every Monday, identify open deals with no recorded activity since
      5 May 2026, listed by the rep who owns them.
User: A RevOps analyst who sends the list to sales managers on Monday morning.
Done: Open deals in Prospecting, Qualification, Proposal or Negotiation whose
      last activity date falls before 5 May 2026, grouped by rep, with the deals
      carrying no activity date counted separately.
```

- **Source data:** `deals-10k.csv` in the project folder — the same 36 columns
  the standalone file carries baked in. The bucket copy at
  storage.googleapis.com/vibecoding-201-data is the read-only original.
- **Access rules:** none exist in the project today; the imported copy is
  readable by the analyst's team and written only by the import (assumed — the
  project names no users).
- **Failure behavior:** what the app already does, kept: a source that cannot be
  read shows a file picker and says so in words; a healthy run with zero quiet
  deals says "0" beside the last import's timestamp.
- **Non-goals:** no write-back to the CSV or the bucket, no CRM integration, no
  email sending — the analyst sends the list.

The Done line is the one to make your own. If your definition of quiet differs —
whether a deal with no activity date counts — your row count will differ, and
that difference is the exercise.
