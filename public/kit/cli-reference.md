# CLI reference

Install commands and first runs, with what each one does and what you should see.

Every command and link below was checked on **27 July 2026**. These tools ship new
versions most weeks. If something fails, open the linked documentation before assuming
you typed it wrong.

## What a CLI is, and why you care

A CLI is a program you run by typing its name in the Terminal instead of clicking it.
You are not being asked to become a command-line user. The reason this matters is that
your coding agent already knows how to drive every one of these, so installing them
opens a door the agent can walk through on your behalf. You install the tool once and
then ask in plain English.

Text in `[square brackets]` is something you replace.

---

## Before anything else, on a Mac

Most of these install through Homebrew, a package manager for macOS. Check whether you
already have it:

```bash
brew --version
```

**You should see** a version number such as `Homebrew 4.x.x`. If you see
`command not found`, install it from [brew.sh](https://brew.sh) first.

---

## Claude Code

Anthropic's coding agent. Docs: <https://code.claude.com/docs/en/overview>

**Install** (recommended, and it keeps itself updated):

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Or through Homebrew, which does not auto-update:

```bash
brew install --cask claude-code
```

**Start it** in a project folder:

```bash
cd [your-project]
claude
```

**You should see** a prompt waiting for input. On first use it asks you to log in,
which opens a browser. A Claude subscription or an Anthropic Console account is
required.

**Worth knowing.** Claude Code reads a file called `CLAUDE.md` at the root of your
project before every session. That file is how your rules get enforced without you
repeating them. See `agent-instructions.md`.

---

## Codex CLI

OpenAI's coding agent. Docs: <https://learn.chatgpt.com/docs/codex/cli>

**Install:**

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```

Or through npm, if you already have Node.js:

```bash
npm install -g @openai/codex
```

**Start it:**

```bash
cd [your-project]
codex
```

**You should see** a prompt, and on first launch a request to authenticate. Choose
**Sign in with ChatGPT**.

**Worth knowing.** Codex reads `AGENTS.md` rather than `CLAUDE.md`. The contents are
the same, so keep one file and copy it to both names.

---

## GitHub CLI

The system of record for your project and every change to it. Docs:
<https://cli.github.com>

**Install:**

```bash
brew install gh
```

**Sign in:**

```bash
gh auth login
```

**You should see** a short series of questions (GitHub.com or an enterprise server,
HTTPS or SSH, authenticate in browser). Choosing the browser option is fine and is the
easiest path. When it finishes it prints a line confirming you are logged in as your
username.

**Check it worked:**

```bash
gh auth status
```

**You should see** your account name and the permissions your login was granted.

**If a later command fails with a permissions error**, your login is missing a scope.
Add it without starting over:

```bash
gh auth login --scopes [the-scope-it-asked-for]
```

**Worth knowing.** You will almost never type `gh` yourself. It is installed so your
agent can create branches, open draft pull requests, and read the results back to you.

---

## Supabase CLI

Where your data lives, who may read it, and what runs on a schedule. Docs:
<https://supabase.com/docs/guides/local-development/cli/getting-started>

**Install:**

```bash
brew install supabase/tap/supabase
```

Or into a single project, if you prefer not to install it system-wide:

```bash
npm install supabase --save-dev
```

**Sign in:**

```bash
supabase login
```

**You should see** a browser open and, once you approve, a confirmation in the
Terminal. This connects the CLI to your Supabase account.

**Set up a project folder:**

```bash
supabase init
```

**You should see** a new `supabase/` folder appear in your project. This is where
database changes get recorded so they can be reviewed and repeated.

**Connect it to your hosted database:**

```bash
supabase link --project-ref [your-project-ref]
```

The project ref is the short code in your Supabase dashboard URL. **You should see** a
confirmation naming the project you linked.

**Run the whole stack on your own machine:**

```bash
supabase start
```

**You should see** a list of local URLs and keys, including a Studio address you can
open in a browser. This runs a complete copy of your database locally, so you can break
things without touching anything real.

The local stack runs in containers, so you need a container runtime installed first.
Docker Desktop is the documented recommendation; Rancher Desktop, Podman, OrbStack and
colima also work.

---

## Vercel CLI

Where the tool becomes a URL. Docs: <https://vercel.com/docs/cli>

**Install:**

```bash
npm i vercel
```

The documentation installs it into the current project. Add `-g` (`npm i -g vercel`)
if you want a `vercel` command available everywhere.

**Check it:**

```bash
vercel --version
```

**Sign in:**

```bash
vercel login
```

**You should see** a browser open, then a confirmation in the Terminal.

**Connect the folder to a Vercel project:**

```bash
vercel link
```

**You should see** questions about which account and project to use, and then a
`.vercel` folder appears. Read the project name back before you accept it. Deploying to
the wrong project is a quiet and embarrassing mistake.

**Deploy a preview:**

```bash
vercel
```

**You should see** a fresh URL that is not linked from anywhere public. This is the one
you check before real people see it. Previews are where you prove a change. Treat the
address as unlisted rather than protected: anyone you send it to can open it.

**Deploy to production:**

```bash
vercel --prod
```

**You should see** your live URL. Run this deliberately. Promotion is a decision
someone makes, never a side effect of saving a file.

**Read the logs of a deployment:**

```bash
vercel logs [deployment-url]
```

**You should see** the record of what actually happened, including the failures.

**Undo a bad release:**

```bash
vercel rollback [deployment-id-or-url]
```

**You should see** production pointing back at the earlier version, within seconds and
without a rebuild. Two things to know before you need it. Only deployments that were
once live on your production domain can be rolled back, so a preview URL is not a
rollback target. And rolling back turns off automatic production deploys until you run
`vercel promote [deployment-id-or-url]`, which looks exactly like a deploy pipeline
that has quietly stopped working.

---

## GitHub Spec Kit

Not a CLI you need, but worth knowing the class's spec idea is not one person's
opinion. Spec Kit is GitHub's own toolkit built on the same premise: each phase
produces an artifact that feeds the next, instead of ad-hoc prompts.

<https://github.com/github/spec-kit>

As of 27 July 2026 it has **124,066 stars and 253 contributors**. Both numbers are
still climbing, so treat them as a floor.

---

## When a command fails

The move is the same every time, and it is the highest-leverage habit in this file.
Copy the exact error, and give your agent three things: what you ran, what happened,
and what you expected instead.

> This failed with [paste the exact error]. Here is what I ran and what happened.
> Diagnose the cause, propose a fix, and tell me how we will know it worked.

Rewriting your original request throws away everything the agent already learned.
Moving to a different platform is shopping rather than solving. Reading every line of
code yourself is the trap that convinces people they need to be engineers.
