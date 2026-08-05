# Example context files

Worked examples of the project context files the class recommends, written for the
starter app — the Monday GTM Dashboard in `../monday-gtm-dashboard-standalone.html`.
Every claim in them is true of that app. Read them once, then copy them into your own
repository and rewrite them for your own tool.

## What is in here

| File | What it holds | Why it exists |
|---|---|---|
| `PRODUCT.md` | What the app is, who opens it, and what it refuses to do | An agent that does not know the job proposes features nobody asked for |
| `ARCHITECTURE.md` | One file, data inside it, no server, no build — and the reason for each | Without the reason, the next change quietly undoes the decision |
| `DATA_MODEL.md` | The columns the panels depend on, and the rule protecting each | A column read the wrong way produces a finished-looking screen with wrong numbers |
| `SECURITY.md` | Who may read and change what, and how it is enforced today | This app enforces nothing, and saying so is the whole point of the file |
| `AGENTS.md` | What to run, what never to touch, what the gate is | The rules specific to this app, on top of `../agent-instructions.md` |
| `env.example` | The names of the values the app needs, never the values | Named `env.example`, because a leading dot gets dropped by static hosts and some zip tools |

## How long these should be

About a page each, because the app is one screen. A context file that takes ten minutes
to read gets skimmed by the person and padded by the agent.

Write `DATA_MODEL.md` and `SECURITY.md` when you have a schema and access rules for them
to describe. A file documenting something you have not built yet is worse than a missing
one, because the next reader believes it.

## Generating your own set

Open your own project in your coding agent and paste the prompt below. Read what comes
back before you keep any of it. These files are only worth having if they are true, and
you are the one who can confirm that.

```text
Read this project end to end and write the following files at its root: PRODUCT.md, ARCHITECTURE.md, DATA_MODEL.md, SECURITY.md, and env.example. PRODUCT.md states what this tool does, who uses it, the check another person could run to prove it works, and what it deliberately does not do. ARCHITECTURE.md states each significant decision visible in the code and why it was made, marking clearly any reason you are inferring rather than reading. DATA_MODEL.md lists what is stored and where, and for each field the rule that protects it. SECURITY.md states who may read and who may change what, and how that is actually enforced today — if nothing is enforced, say that plainly instead of describing what should be. env.example lists the name of every environment variable the code reads, with no values. Keep each file under one page. Every claim must be something you found in this project: list separately anything you could not determine, and never fill a gap with a plausible guess.
```

Then read `../agent-instructions.md` for the `CLAUDE.md` that goes with these, and the
requests that make an agent hand back something you can review.
