# Prompt pack

Thirteen requests that produce something you can review.

Two of these appeared on screen during class and are reproduced **word for word**. Paste
those exactly. An attendee pasting a paraphrase into their agent gets different
behaviour from the one the slide promised, which is the whole reason they are quoted
rather than summarised.

Each prompt carries three notes: when to use it, the artifact it should hand back, and
what a bad response looks like. The third note is the one that matters. Directing an
agent well is mostly the ability to recognise a confident answer that is wrong.

Replace anything in `[square brackets]` before sending.

---

## 0. The three-line spec

Not a prompt. The thing you write before any prompt, by hand, in under two minutes.

The example is Jordan's, the VP of RevOps whose churn-risk dashboard runs through the
whole class:

```text
Job:  [Every Monday, identify the ten accounts most at risk of churn and show the
       evidence behind each flag.]
User: [The VP of RevOps and the assigned account owner.]
Done: [A user can sign in, load current records, understand every flag, update the
       next action, refresh, and confirm the change persists.]
```

Then four constraints underneath, which do not belong in the three lines:

- **Source data.** Where the real records come from.
- **Access rules.** Who may read what, and who may change what.
- **Failure behavior.** What the user sees when an upstream breaks.
- **Non-goals.** What this version deliberately does not do.

**The test of a good Done.** Another person can follow the steps and get the same
answer. "Preserves updates" is a wish. "Change an account's next action, refresh,
confirm it persists" is a check. If you cannot write the steps, you do not yet know
what you are asking for.

---

## 1. Repository assessment

**When.** You have inherited a project, or you built something weeks ago and cannot
remember its shape.

```text
Read this project and describe it back to me in plain language: what it does, who it
is for, where its data lives, what it connects to, and what it requires to run.
List anything that looks unfinished, unused, or unsafe. Do not change any files.
```

**Artifact.** A written description you can check against your own understanding, plus
a list of concerns.

**A bad response** describes what the project intends rather than what it contains, or
starts editing files. If it cannot tell you where the data lives, it has not read the
project.

---

## 2. The plan prompt

> **Verbatim from the class. Paste exactly.**

```text
Inspect the current project. Propose the smallest coherent implementation for this specification. Identify the data model, permissions, environment variables, failure states, tests, and files involved. Do not change anything until I approve the plan.
```

**When.** Before any code changes, every time. This is the single highest-leverage
habit in the class. The plan is the artifact you review, not the code.

**Artifact.** A written plan naming the data model, the permissions, the environment
variables, the failure states, the tests, and the files. Nothing edited yet.

**A bad response** starts writing code, proposes a large implementation when a small
one would do, or leaves out permissions and failure states. Silence on permissions is
the most common and most expensive omission.

**Your five questions of any plan.** Does it solve the stated job? What assumptions did
it invent? What data and permissions does it require? How will the core workflow be
tested? What is deliberately excluded?

---

## 3. Data model and access rules

Row-level security means the database itself decides which rows a given user may read
or change. It is the difference between hiding records on screen and them being
genuinely unreachable.

```text
Propose the smallest data model for this specification, and write the access rules as
database policies rather than interface logic. For each table, state who may read it,
who may write it, and what happens to a request from a user who belongs to a different
organisation. Then write the test that proves a cross-organisation read fails.
Show me the model and the policies before applying anything.
```

**Artifact.** A table-by-table model, the policies in writing, and a test for the
cross-organisation case.

**A bad response** enforces permissions in the interface, gives one role access to
everything for convenience, or writes the policies without the test that proves they
work.

---

## 4. Feature implementation

```text
Implement only [one bounded capability] from the approved plan. Do not add anything
that was not in the plan. When you are done, summarise what changed, what you assumed,
and what you did not do.
```

**When.** After a plan is approved. One capability at a time.

**Artifact.** A small change, plus a summary naming its assumptions and its gaps.

**A bad response** implements three things you did not ask for, or reports completion
without naming a single assumption. Every implementation invents assumptions. An agent
that claims none did not look.

---

## 5. Security review

```text
Review this project for security problems a non-engineer would not spot. Check
specifically: secrets readable in browser code or committed to the repository, records
one organisation can read from another, endpoints with no permission check, and
anything that trusts input from the browser. For each finding, tell me the risk in
business terms and the smallest fix.
```

**Artifact.** A findings list with business consequences, not severity labels.

**A bad response** returns a generic checklist of good practice rather than findings
about this project, or reports "no issues found" without saying what it examined.

---

## 6. Error-handling review

```text
Walk through what a user sees when each upstream this project depends on fails: the
database, the integration, the authentication provider, and any scheduled job. For
each one, tell me whether the failure is visible to the user, visible to an operator,
or silent. List the silent ones first.
```

**When.** Before anyone else depends on the tool. Silent failures are the expensive
kind, and they are invisible in a demo.

**Artifact.** A failure-by-failure table, silent ones at the top.

**A bad response** describes the error handling that exists rather than tracing what a
person would actually see. Ask it to name the screen.

---

## 7. Test generation

```text
Write tests for this workflow covering: the happy path, an unauthorised access
attempt, malformed input, a duplicate submission, an upstream failure, and persistence
after a refresh. Confirm each test fails against the current code before you make it
pass, and show me that failure.
```

**When.** Alongside the build, not after it.

**Artifact.** Six tests, and evidence each one failed first. A test that has never
failed is not known to be testing anything.

**A bad response** writes tests that pass immediately, or skips the unauthorised-access
and duplicate-submission cases. Those two are where real tools break.

**Your part.** You define the behaviour and you verify as a user. The agent writes the
test, confirms it fails, implements, and runs it until green. You own the first step
and the last one.

---

## 8. Idempotency review

```text
For every automated action in this project, answer one question: what happens if this
runs twice? Cover imports, webhooks, CRM writes, and scheduled jobs. Where a repeat
would create a duplicate record instead of updating the existing one, show me the fix.
```

**When.** Any time something runs on a schedule or responds to an external event.

**Artifact.** An action-by-action answer, and a fix for each repeat that would
duplicate.

**A bad response** answers in general terms. The duplicate stays invisible until a
customer finds it, so make it enumerate every action by name.

---

## 9. The AI insight rule

```text
Separate calculation from explanation in this feature. Deterministic code must produce
every number: the score, the thresholds, the ranking, reproducible and auditable. The
model may explain why a record is flagged and recommend a next action, in language the
user can act on. Show me where that line currently sits, and move anything on the
wrong side of it.
```

**When.** Any time a model is producing something a person will present as fact.

**Artifact.** A map of which side each number falls on, and the changes needed.

**A bad response** leaves the model computing the score. If nobody in the room can
reproduce the number, you cannot defend it, and the tool becomes a black box the week
after it launches.

---

## 10. The delegation prompt

> **Verbatim from the class. Paste exactly.**

```text
Create a branch, make the approved change, run the tests, summarize the diff, and open a draft pull request. Do not merge it.
```

**When.** Every change, once a plan is approved. This is how you use GitHub without
touching a command line.

**Artifact.** A branch, a test run, a summary of the difference, and a draft pull
request nobody has merged.

**A bad response** commits straight to the main branch, merges the pull request, or
opens it without running the tests. The words "draft" and "do not merge" are the
safety, so keep them.

---

## 11. Pull-request review

```text
Review this pull request as though you did not write it. What does it change, what
could it break, what is not covered by a test, and what would you want to know before
approving it? Be specific about risk to data and to permissions.
```

**When.** Before you approve anything, including your own work.

**Artifact.** A review naming risks and gaps rather than restating the change.

**A bad response** summarises the difference and calls it a review, or approves its own
work. Ask it what it would want to know before approving; the answer is usually the
thing worth checking.

---

## 12. Operational runbook

```text
Write the runbook for this tool: how to tell it is healthy, the three most likely
failures and what to do about each, how to roll back a bad release, who to contact,
and what to check before shutting it down. Write it for someone who did not build it
and is reading it under pressure.
```

**When.** Before the tool goes live, while you still remember how it works.

**Artifact.** A document a colleague could follow at 8am on a Monday without calling
you.

**A bad response** documents the architecture rather than the operations, or assumes
the reader knows the system. The test is whether your backup owner could use it.

---

## 13. Choosing the data door

There are five ways to get real data into a tool, and they are situational choices
rather than a ranking:

| Door | Suits | Costs you |
| --- | --- | --- |
| **Manual** | Rare, ambiguous, judgment-heavy work | Stale data and human effort |
| **Computer use** | A stable interface with no usable integration | Fragility and terms-of-service limits |
| **API** | The preferred connection for app-to-app work | Auth, rate limits, engineering overhead |
| **MCP** | Governed agent access to tools and context | Connector quality and permissions |
| **CLI** | The agent's own surface for GitHub, Vercel, Supabase, tests, logs | Powerful access needs strong guardrails |

Choose on frequency, consequence, volume, expected lifetime, stability, and retry
safety.

```text
I need [this data] from [this source], [this often], and it will be used for [this
decision]. Compare the proportionate ways to connect it: manual export, browser
automation, a direct API, an MCP connector, and driving the vendor's own CLI. For each,
tell me what breaks it, what it costs to maintain, and what happens when it fails
silently. Recommend the least complex option that is reliable enough, and say what
would make you change that recommendation.
```

**Artifact.** A comparison grounded in your actual frequency and consequence, plus one
recommendation with its reversal condition.

**A bad response** reaches for the most sophisticated option available, or proposes
building an API for a system you do not own. You cannot build an API for someone else's
website. Automated is also not the same as reliable: a browser workflow needs
validation, change detection, and a human exception path before you can trust it.
