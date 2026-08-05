# The evaluation prompt

Open your coding agent in the folder of something you have already built and paste
this. It returns a verdict — prototype, tool, or system — with the evidence that
decided it. Nothing to evaluate? Run it against the starter app from this kit.

```text
Read this project and evaluate it. Do not change anything.

First, classify it as one of the following, by what you can observe in the
code and configuration — never by what the interface promises:

- Prototype: demonstrates the idea with sample or temporary inputs.
- Tool: a defined group reliably completes a real workflow with it.
- System: it runs across teams, data sources, permissions, time, and failure.

Then score it against each item below, answering met, not met, or cannot tell,
with one line of evidence per item — a file, a config entry, or the absence of one:

1. Persistent data — records survive a refresh because they live in a real database.
2. Sign-in — the tool knows who each user is.
3. Enforced authorization — the database decides what each user may see, not the interface.
4. Server-side secrets — no credential values appear anywhere in the code.
5. A tested critical workflow — the main workflow runs under an automated test.
6. Visible error states — every failure says what happened in words.
7. Logs and analytics — every run leaves a record someone can read back.
8. Preview before production — a person promotes each change; saving a file is not shipping.
9. A named owner — someone answers when it breaks, and can roll it back.

Finish with exactly three lines I can paste into a shared box:
Verdict: <prototype | tool | system>
Evidence: <the one observation that decided it>
First gap: <the unmet item that matters most, and the smallest change that would meet it>
```

**When.** The start of any conversation about whether something is ready for more
users — including the one where you are the only user so far.

**Artifact.** A verdict with evidence, an item-by-item score, and the first gap.

**A bad response** classifies by ambition ("this is meant to be a system") or scores
an item met because the interface looks finished. Every answer has to point at a
file. "Cannot tell" is a real answer and usually means the evidence does not exist.

The items are the same standard as the [production readiness
checklist](production-readiness-checklist.md), so the score your agent returns here
is the same score you can keep working against after class.
