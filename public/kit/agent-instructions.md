# Agent instructions

A starter `CLAUDE.md` for your own repository, and the requests you make of it.

Coding agents read a file at the root of your project before they do anything else.
Claude Code reads `CLAUDE.md`; Codex and several others read `AGENTS.md`. The contents
are the same, so write one and copy it to the other name.

This file is worth more than it looks. The subscription rents you intelligence, and
roughly a billion people have the same assistant you do. These files are how your
organisation's way of working gets into it. They compound, and they move with you when
the model of the month changes.

---

## The starter file

Copy everything in the block below into `CLAUDE.md` at the root of your project, then
replace the bracketed parts. Delete any rule you are not actually going to enforce; a
rule the project ignores teaches the agent that rules are optional.

```markdown
# Working in this repo

## What this is

[One sentence: what the tool does and who uses it.]

Job:  [the recurring workflow this serves]
User: [who performs it, and what they are allowed to change]
Done: [a check another person could run]

## How to run it

​```bash
[the command that starts it locally]   # you should see [what]
[the command that runs the tests]      # this is the gate
​```

## Rules

- **Propose a plan before changing anything.** Identify the data model, permissions,
  environment variables, failure states, tests, and files involved. Wait for approval.
- **One bounded capability at a time.** Do not add anything that was not in the
  approved plan. Say what you assumed and what you did not do.
- **Never commit to the main branch.** Create a branch, open a draft pull request, and
  do not merge it.
- **Secrets never go in the repository or in browser code.** Real values live in
  `.env.local`, which is never committed. `.env.example` carries the names only.
- **Permissions are enforced in the database, not in the interface.** Hiding a record
  on screen is not security.
- **Deterministic code calculates; the model explains.** Every number a user will
  present as fact must come from code that can be re-run and audited. The model may
  explain and recommend.
- **Anything automated must be safe to run twice.** Update the existing record rather
  than creating a duplicate.
- **A test that has never failed is not a test.** Confirm each one fails against the
  broken behaviour before you make it pass.
- **Never claim something works without running it.** [Name the command that proves it.]

## Known limitations

- [The thing that is not finished, stated plainly.]

## Owner

[Your name and email.] See `ownership-card.md`.
```

### The rest of the harness

`CLAUDE.md` is one of six files the class recommends keeping in the repository:

```text
PRODUCT.md        what this is, who it serves, and what it deliberately does not do
ARCHITECTURE.md   the decisions behind the layout, and why each one is the way it is
DATA_MODEL.md     the tables, and who may read or write each one
SECURITY.md       secrets, permissions, and the access rules you enforce
CLAUDE.md         the rules above (copy to AGENTS.md)
.env.example      the names of your secrets, never the values
```

Write `DATA_MODEL.md` and `SECURITY.md` when you have a schema for them to describe.
A file that documents something you have not built yet is worse than a missing one,
because the next reader believes it.

---

## Requests that work

Plain English, no command line. Each one names the artifact you should get back.

**Open and run the project.**
> Open this project, install what it needs, start it locally, and tell me the URL to
> open and what I should expect to see.

**Diagnose a setup failure.**
> This failed with [paste the exact error]. Here is what I ran and what happened.
> Diagnose the cause, propose a fix, and tell me how we will know it worked.

Debugging is delegation with evidence attached. Paste the error, the steps that
produced it, and the behaviour you expected. Rewriting the original request throws away
everything the agent has learned, and switching platforms is shopping rather than
solving.

**Create a branch.**
> Create a branch named [something-descriptive] and switch to it. Confirm which branch
> I am on now.

**Run the tests.**
> Run the tests and show me the output. If any fail, tell me what broke and what it
> means in plain language before you change anything.

**Summarise a diff.**
> Summarise what changed on this branch compared to main: which files, what behaviour
> changed, and anything that could affect data or permissions.

**Open a draft pull request.** Word for word from the class; paste it exactly.

```text
Create a branch, make the approved change, run the tests, summarize the diff, and open a draft pull request. Do not merge it.
```

**Create a preview.**
> Deploy this branch to a preview URL and give me the link. Do not deploy to
> production.

**Inspect deployment logs.**
> Show me the logs for the most recent deployment. List any errors, and tell me whether
> a user would have noticed them.

**Verify without touching production.**
> Walk me through how to confirm this works on the preview URL: what to click, what to
> expect, and how to tell the difference between working and merely not erroring.

---

## The two steps you never delegate

The agent writes the test, confirms it fails, implements, and runs it until green. You
define the behaviour at the start, and you verify as a user at the end. Owning those
two steps is what Director Mode means in practice: you wrote the finish line, and it
ran the race.
