# The spec prompt

The bridge between the evaluation and the plan, for the app you actually have. The
[evaluation prompt](the-bar-prompt.md) ends with a verdict and a first gap; this
prompt turns that result into a three-line spec for your own project — any project,
not the starter app. Paste it into your coding agent in the folder of the app you
evaluated, with the evaluation's three lines pasted where marked.

```text
Read this project. Do not change anything.

Here is the evaluation this project just received:

Verdict: [paste the verdict line]
Evidence: [paste the evidence line]
First gap: [paste the first-gap line]

Propose up to three candidate features, each a bounded piece of work this project
could ship next. The first gap from the evaluation is one candidate; find the others
in the project itself. For each candidate, give me one line: what it is, who would
use it, and what would prove it done. Then stop and wait for me to choose.

When I choose, draft the spec for that one feature in exactly this form:

Job:  One sentence. The recurring task this feature performs, with its schedule if
      it has one.
User: The person or role who depends on the result.
Done: The steps another person could follow to confirm it works — written as checks
      a stranger could run, not wishes.

Underneath the three lines, four constraints:

- Source data: where the real records come from in this project.
- Access rules: who may read what, and who may change what.
- Failure behavior: what the user sees when an upstream breaks.
- Non-goals: what this version deliberately does not do.

Every line must come from what this project actually contains. Mark any line you
could not verify with the word "assumed" so I can correct it. Do not write any code
and do not propose an implementation — that is the next prompt's job.
```

**When.** Right after the evaluation prompt returns its verdict, in the same
conversation or a new one. This is the step between "here is my gap" and "here is my
plan."

**Artifact.** A short list of candidates, then — after you choose — a three-line spec
with four constraints, drafted from your project's own contents, with every guess
marked.

**A bad response** skips the wait and specs a feature you did not choose, writes a
Done line you cannot follow as a stranger ("works reliably" is a wish, not a check),
or drafts constraints from what the project intends rather than what it contains. An
agent that marks nothing "assumed" did not look.

**Your part.** The agent drafts; you own the Done line. Read it as the stranger who
has to run the checks: if you cannot follow the steps, rewrite them until you can.
An edited Done line is the sign the spec is yours rather than the agent's.

Then fire the plan prompt — prompt 2 in the [prompt pack](prompt-pack.md), verbatim —
with your spec pasted above it. From there the loop runs the same in every project:
Spec, Plan, Build, Test, Ship, Run.
