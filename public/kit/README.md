# Vibecoding 201 participant kit

Building Production GTM Tools. Pavilion AI in GTM School, taught by Scott Ewalt,
Cardinal Element.

The class argues one thing: AI made the visible part of software cheap, so the
remaining value and risk sit in the invisible system underneath it. This kit is that
invisible system, written down. It holds the artifacts rather than the theory.

## What is in here

| File | Use it when |
| --- | --- |
| `monday-gtm-dashboard-standalone.html` | The starter app — the app the class hour works in unless you brought your own. Double-click it and it runs, with the CRM data inside it. |
| `no-account-path.md` | Nothing installed and no accounts — the whole class hour with a browser and whatever assistant you already use. |
| `pregenerated-plan.md` | Your plan prompt returned nothing usable and the exercise clock is running. |
| `prompt-pack.md` | You are directing an agent and want the request to produce something you can review. |
| `agent-instructions.md` | You are starting a repository and want the agent to know your rules from day one. |
| `production-readiness-checklist.md` | You are deciding whether a tool is safe for colleagues to depend on. |
| `ownership-card.md` | A tool is about to go live and needs a human whose name is on it. |
| `cli-reference.md` | You are installing the tools, or you have forgotten what a command does. |
| `four-ways-to-cross-the-gap.md` | You are choosing a route to production, or making the case to buy instead of build. |

## How to use it

Start with the homework. Ship one narrow internal tool with a real user and a real
URL, and bring back three things: your three-line spec, the live link or a recorded
walkthrough, and one known limitation. The limitation is the item that proves you
actually verified it.

The order that works:

1. Ask whether it should be built at all: is the workflow frequent or consequential
   enough to matter, is the process stable enough to encode, is there a named user,
   outcome, and owner, and what new risk appears when others depend on it. Most
   prototypes should die at this question, and killing one early is the system
   working.
2. Write the three-line spec: Job, User, and a Done another person can check.
   `prompt-pack.md` opens with this.
3. Work the 201 Loop: Spec, Plan, Build, Test, Ship, Run. Every step leaves an
   artifact you can show someone.
4. Before anyone else depends on it, run `production-readiness-checklist.md` and fill
   in `ownership-card.md`.

## Who this is for

GTM leaders who direct the work rather than type it. Nothing here asks you to write
code. Every command in `cli-reference.md` says what it does and what you should see
when it works, because a command you cannot verify is a command you cannot trust.

## A note on the tools named here

Every URL, install command, and figure in this kit was checked on **27 July 2026**.
Tooling in this category changes monthly. If a command fails, check the linked
documentation before assuming you did something wrong.

Questions after class: Scott Ewalt, scott@cardinalelement.com
