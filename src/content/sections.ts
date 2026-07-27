import type { StaticImageData } from "next/image";

import threshold from "@/assets/threshold.webp";
import recordRefreshB from "@/assets/record-refresh-b.webp";
import opsRoomA from "@/assets/ops-room-a.webp";
import opsRoomB from "@/assets/ops-room-b.webp";
import opsRoomC from "@/assets/ops-room-c.webp";
import agentA from "@/assets/agent-a.webp";
import agentB from "@/assets/agent-b.webp";
import failureB from "@/assets/failure-b.webp";

export type LayoutKind =
  | "hero"
  | "split"
  | "claim"
  | "cards"
  | "timeline"
  | "chart"
  | "loop"
  | "cta"
  | "prompt"
  | "poll"
  | "exercise";

export type Media = {
  image?: StaticImageData;
  video?: string;
  poster?: string;
  /** -1 … 1. Negative drifts up as you scroll down (further away). */
  speed?: number;
};

export type Card = {
  label?: string;
  title: string;
  body?: string;
  /** The card's second line from the deck — a cost, a role, a surface list. */
  meta?: string;
  /**
   * Evidence for a claim the card makes, in this repository.
   *
   * Used by The Bar, where every item has to be checkable by an attendee who
   * goes looking. A claim with no link is a claim, and the section says which
   * of the two it is rather than letting the reader assume.
   */
  href?: string;
  /** false renders the item as honestly unmet rather than quietly omitted. */
  met?: boolean;
};

export type TimelineStop = {
  day: string;
  title: string;
  body?: string;
  image?: StaticImageData;
  tone?: "neutral" | "bad";
};

/** One answer in a poll. `id` matches poll_options.id in Postgres. */
export type PollOption = {
  id: string;
  label: string;
  body: string;
  /** The option's own name on the slide, above its description. */
  name?: string;
  /**
   * A screenshot, for the two-up variant. Absent means the built-in mock —
   * which is the honest rendering for the cold open, where the argument is
   * that the two screens are pixel-for-pixel the same.
   */
  image?: StaticImageData;
};

/**
 * A live poll. The registry carries the question and the options and nothing
 * else — everything a poll withholds until the reveal lives in Postgres behind
 * a column grant, because this file is imported by client code and everything
 * in it ships to the browser.
 */
export type Poll = {
  slug: string;
  options: PollOption[];
  /** `two-up` shows each option as a screen. Default is a stacked list. */
  variant?: "list" | "two-up";
};

/**
 * A hands-on exercise: a timer, somewhere to write, and a route to the room.
 *
 * `id` matches submissions.exercise_id in Postgres. Nothing about sharing lives
 * here — the author sets `shared_at` on their own row, an admin sets
 * `surfaced_at`, and a check constraint refuses the second without the first.
 */
export type Exercise = {
  id: string;
  seconds: number;
  placeholder: string;
};

/** A prompt the reader copies into their own agent. Quoted from the deck verbatim. */
export type Prompt = {
  /** Stable across edits — it identifies the prompt in copy analytics. */
  id: string;
  label: string;
  text: string;
  caption?: string;
};

/** An outbound reference. `install` renders as a second, copyable line. */
export type LinkRef = {
  label: string;
  href: string;
  note?: string;
  /** A one-line install command, for CLI entries. */
  install?: string;
};

export type Section = {
  id: string;
  theme: "dark" | "light";
  layout: LayoutKind;
  eyebrow?: string;
  title: string;
  /**
   * What the navigation rail calls this section.
   *
   * Rail chrome, never rendered on the slide, so it is the one string here not
   * bound by the deck. Sections the deck gives no eyebrow fall back to the
   * title, and a whole-sentence title truncates mid-word in the rail.
   */
  railLabel?: string;
  /** Words to render in magenta inside the title. */
  accent?: string;
  lede?: string;
  kicker?: string;
  /**
   * A labelled band of items from the slide — the minimum standard, Jordan's
   * rules, the minimum test pack. Content, not a citation: it renders at body
   * size on its own surface. Use `footnote` for asides and sources.
   */
  strip?: { label?: string; items: string[] };
  footnote?: string;
  /** Makes the footnote a link — evidence a reader can open. */
  footnoteHref?: string;
  media?: Media;
  cards?: Card[];
  timeline?: TimelineStop[];
  chart?: "ladder" | "scurve" | "gap";
  split?: { label: string; title: string; body: string; image: StaticImageData }[];
  loopSteps?: string[];
  prompts?: Prompt[];
  links?: LinkRef[];
  poll?: Poll;
  exercise?: Exercise;
};

export const sections: Section[] = [
  {
    id: "title",
    theme: "dark",
    layout: "hero",
    eyebrow: "Vibecoding 201",
    title: "Building Production GTM Tools",
    accent: "Production",
    lede: "Taking one GTM prototype from a chat window to a tool your team depends on.",
    kicker: "Scott Ewalt · Founder, Cardinal Element",
    footnote: "Pavilion AI in GTM School · 90 minutes: 60 content, 30 Q&A",
    media: { image: threshold, speed: -0.18 },
  },
  {
    id: "cold-open",
    theme: "dark",
    layout: "poll",
    eyebrow: "Cold open",
    title: "Two identical screens. Radically different value.",
    accent: "Radically different value.",
    lede: "Which one would you trust to run Monday's retention meeting? Vote in the chat.",
    poll: {
      slug: "cold-open",
      variant: "two-up",
      options: [
        {
          id: "cold-open:a",
          label: "A",
          name: "Screen A",
          body: "Built in 12 minutes. Sample data. Open link.",
        },
        {
          id: "cold-open:b",
          label: "B",
          name: "Screen B",
          body: "Stores real records, controls access, refreshes itself, logs failures.",
        },
      ],
    },
  },
  {
    id: "governing-claim",
    theme: "dark",
    layout: "claim",
    eyebrow: "The governing claim",
    title:
      "AI made the visible part of software cheap. The remaining value and risk sit in the invisible system underneath it.",
    accent: "invisible system underneath it.",
    kicker: "Code is no longer the primary bottleneck. Judgment is.",
  },
  {
    id: "jordan",
    railLabel: "The running case",
    theme: "light",
    layout: "timeline",
    eyebrow: "The running case · Jordan, VP RevOps",
    title: "The week Jordan's prototype died.",
    accent: "died.",
    timeline: [
      {
        day: "Sunday",
        title: "Builds a polished churn-risk dashboard in Lovable",
        image: opsRoomA,
      },
      {
        day: "Monday",
        title: "Leadership loves it, asks the team to use it every Monday",
        image: opsRoomB,
      },
      {
        day: "Tuesday",
        title: "The team asks for logins and real accounts",
        tone: "bad",
      },
      {
        day: "Wednesday",
        title: "The data disappears after a refresh",
        tone: "bad",
        image: opsRoomC,
      },
      {
        day: "Thursday",
        title: "Nobody can explain the risk score",
        tone: "bad",
      },
      {
        day: "Friday",
        title: "The spreadsheet returns",
        tone: "bad",
      },
    ],
  },
  {
    id: "six-defects",
    theme: "dark",
    layout: "cards",
    eyebrow: "The promise of the next hour",
    title: "The six defects we will repair",
    accent: "six defects",
    cards: [
      { label: "01", title: "Data disappears after refresh", meta: "Build · persistence" },
      { label: "02", title: "No sign-in or access control", meta: "Build · identity" },
      { label: "03", title: "The CRM connection is manual", meta: "Build · the data door" },
      { label: "04", title: "Failed refreshes look successful", meta: "Build · the freshness surface" },
      { label: "05", title: "Nobody can explain the risk score", meta: "Build · the AI insight rule" },
      { label: "06", title: "Only Jordan knows how it works", meta: "Run · ownership" },
    ],
    kicker: "The last three fail silently. That is what makes them expensive.",
  },
  {
    id: "ladder",
    theme: "dark",
    layout: "chart",
    chart: "ladder",
    eyebrow: "Prototype, tool, system",
    title: "How to tell them apart",
    accent: "apart",
    kicker: "Most prototypes should not become production tools.",
    media: {
      video: "/media/three-environments.mp4",
      poster: "/media/three-environments-poster.jpg",
      speed: -0.12,
    },
  },
  {
    id: "production-gate",
    theme: "light",
    layout: "cards",
    eyebrow: "The production gate",
    title: "Before you invest further, ask four questions.",
    accent: "four questions.",
    cards: [
      { label: "01", title: "Is the workflow frequent or consequential enough to matter?" },
      { label: "02", title: "Is the process stable enough to encode?" },
      { label: "03", title: "Is there a named user, outcome, and owner?" },
      { label: "04", title: "What new risk appears when others depend on it?" },
    ],
    kicker:
      "Most prototypes should die here. That is the system working, not a waste.",
    media: { image: opsRoomB, speed: -0.1 },
  },
  {
    id: "should-die",
    railLabel: "Permission to stop",
    theme: "dark",
    layout: "claim",
    title: "Most prototypes should die at the gate.",
    accent: "die at the gate.",
    kicker:
      "A prototype that proves an idea is not worth operating saves you every hour you would have spent maintaining it. I have never seen anyone celebrate that.",
  },
  {
    id: "the-loop",
    theme: "dark",
    layout: "loop",
    eyebrow: "The 201 Loop",
    title: "This is how you work.",
    accent: "you",
    loopSteps: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
    lede: "It replaces “prompt until something looks right.” Every step has an artifact you can show someone.",
    kicker: "Worth building? → the gate comes before the loop",
    media: {
      video: "/media/workflow-loop.mp4",
      poster: "/media/workflow-loop-poster.jpg",
      speed: -0.1,
    },
  },
  {
    id: "spec-lines",
    theme: "dark",
    layout: "cards",
    eyebrow: "Spec · step 1 of 6",
    title: "What makes it a spec",
    accent: "spec",
    lede: "Not just a better prompt. A prompt has no downstream. A spec feeds the next step. It is an artifact. A file the next step reads, not a message that scrolls away. It is versioned. It changes on purpose, and you can see what changed. It is testable. Done is a check another person can run.",
    cards: [
      {
        label: "01",
        title: "Job",
        body: "Every Monday, identify the ten accounts most at risk of churn and show the evidence behind each flag.",
      },
      {
        label: "02",
        title: "User",
        body: "The VP of RevOps and the assigned account owner.",
      },
      {
        label: "03",
        title: "Done",
        body: "A user can sign in, load current records, understand every flag, update the next action, refresh, and confirm the change persists.",
      },
    ],
    kicker:
      "Four constraints go underneath, not in the mnemonic: source data, access rules, failure behavior, non-goals.",
    footnote:
      "This is the premise of GitHub Spec Kit (106K+ stars, 200+ contributors): each phase produces an artifact that feeds the next, instead of ad-hoc prompts.",
  },
  {
    id: "spec-testable",
    theme: "light",
    layout: "split",
    eyebrow: "Spec · the key move",
    title: "Say how you will check it",
    accent: "check it",
    split: [
      {
        label: "Vague",
        title: "“Preserves updates”",
        body: "Nobody can run this. Two people will read it differently and both will believe they are done.",
        image: agentA,
      },
      {
        label: "Testable",
        title: "“Change an account's next action, refresh, confirm it persists.”",
        body: "Anyone can follow those steps and get the same answer. That is what makes it checkable — by you, by the person who asked for it, and by the agent while it is building.",
        image: recordRefreshB,
      },
    ],
    kicker:
      "If you cannot write the steps, you do not yet know what you are asking for.",
  },
  {
    id: "spec-exercise",
    theme: "dark",
    layout: "exercise",
    exercise: {
      id: "spec",
      seconds: 120,
      placeholder:
        "Job — …\nUser — …\nDone — …\n\nAccess rule · failure state · non-goal",
    },
    eyebrow: "Hands on · timer on screen",
    title: "Write your three-line spec. 120 seconds.",
    accent: "120 seconds.",
    cards: [
      {
        label: "01",
        title: "Job",
        body: "One narrow recurring GTM workflow. Start with a verb: identify, prepare, route, reconcile, summarize, approve.",
      },
      {
        label: "02",
        title: "User",
        body: "Who performs it, and what are they allowed to change?",
      },
      {
        label: "03",
        title: "Done",
        body: "A check another person could run. Not a feeling.",
      },
    ],
    kicker:
      "Then add one access rule, one failure state, one non-goal. Put it in the chat. I will read two aloud and tighten them live.",
  },
  {
    id: "director-mode",
    theme: "light",
    layout: "prompt",
    eyebrow: "Plan · step 2 of 6",
    title: "Approve the plan before any code changes.",
    accent: "before any code changes.",
    lede: "You are not pretending to be an engineer. You are directing AI as your engineer.",
    prompts: [
      {
        id: "plan-approval",
        label: "The plan prompt",
        text: "Inspect the current project. Propose the smallest coherent implementation for this specification. Identify the data model, permissions, environment variables, failure states, tests, and files involved. Do not change anything until I approve the plan.",
        caption:
          "The last sentence is the whole prompt. Without it the agent writes code you then have to review; with it, the artifact you review is a plan, which is far cheaper to change.",
      },
    ],
    links: [
      {
        label: "GitHub Spec Kit",
        href: "https://github.com/github/spec-kit",
        note: "Each phase produces an artifact that feeds the next.",
      },
      {
        label: "Claude Code",
        href: "https://code.claude.com/docs/en/overview",
        install: "npm i -g @anthropic-ai/claude-code",
      },
      {
        label: "Codex CLI",
        href: "https://learn.chatgpt.com/docs/codex/cli",
        install: "npm i -g @openai/codex",
      },
      {
        label: "GitHub CLI",
        href: "https://cli.github.com/",
        install: "brew install gh",
      },
    ],
    kicker:
      "Director Mode moves expertise from typing syntax to defining, testing, and judging the work.",
  },
  {
    id: "plan-questions",
    theme: "dark",
    layout: "cards",
    eyebrow: "Plan · your job during the demo",
    title: "Five questions to ask of any plan.",
    accent: "Five questions",
    cards: [
      { label: "01", title: "Does it solve the stated job?" },
      { label: "02", title: "What assumptions did it invent?" },
      { label: "03", title: "What data and permissions does it require?" },
      { label: "04", title: "How will the core workflow be tested?" },
      { label: "05", title: "What is deliberately excluded?" },
    ],
    kicker: "Approve or revise. Then let it implement one bounded capability.",
  },
  {
    id: "build-stack",
    theme: "light",
    layout: "cards",
    eyebrow: "Build · step 3 of 6",
    title: "Recommended build stack and minimum standard",
    accent: "minimum standard",
    cards: [
      { label: "01", title: "Lovable or Artifact" },
      { label: "02", title: "GitHub" },
      { label: "03", title: "Claude Code or Codex" },
      { label: "04", title: "Supabase" },
      { label: "05", title: "Vercel preview" },
      { label: "06", title: "Production" },
    ],
    strip: {
      label: "Minimum standard before colleagues depend on it",
      items: [
        "Persistent data",
        "sign-in",
        "enforced authorization",
        "server-side secrets",
        "a tested critical workflow",
        "visible error states",
        "logs",
        "preview before production",
        "a named owner",
      ],
    },
    kicker: "You direct. The agent handles the syntax.",
  },
  {
    id: "layer-jobs",
    theme: "dark",
    layout: "cards",
    eyebrow: "Build · what each layer is for",
    title: "What GitHub, Supabase, and Vercel each do",
    accent: "each do",
    cards: [
      {
        label: "01",
        title: "GitHub",
        body: "The system of record for the application and its changes.",
        meta: "repository · branch · pull request · merge",
      },
      {
        label: "02",
        title: "Supabase",
        body: "Persistence and permission.",
        meta: "Postgres · auth · row-level security · server functions · scheduled work",
      },
      {
        label: "03",
        title: "Vercel",
        body: "Where it becomes a URL.",
        meta: "local · preview · production · logs · environment configuration",
      },
    ],
    prompts: [
      {
        id: "branch-and-pr",
        label: "The delegation prompt",
        text: "Create a branch, make the approved change, run the tests, summarize the diff, and open a draft pull request. Do not merge it.",
        caption:
          "GitHub is the layer most GTM leaders have never touched. This prompt means you never have to — the agent drives it, and you review the diff.",
      },
    ],
  },
  {
    id: "demo-inspect",
    theme: "light",
    layout: "cards",
    eyebrow: "Demonstration · window 1 of 3",
    title: "The demo, in four steps",
    accent: "four steps",
    cards: [
      { label: "01", title: "The repository", body: "The Lovable project, already in GitHub." },
      { label: "02", title: "The inspection", body: "The agent reads the project before acting." },
      { label: "03", title: "The plan", body: "Proposed before any file changes. You approve it." },
      { label: "04", title: "One persistent action", body: "Written to Supabase, survives a refresh." },
    ],
    kicker:
      "Narrate evidence, not keystrokes: what files changed, what it inferred, what I still have to inspect myself.",
  },
  {
    id: "harness",
    theme: "dark",
    layout: "cards",
    eyebrow: "Build · the harness",
    title: "Six files to keep in the repository",
    accent: "Six files",
    cards: [
      { label: "01", title: "PRODUCT.md", body: "What this is, who it serves, and what it deliberately does not do." },
      { label: "02", title: "ARCHITECTURE.md", body: "The decisions and why, so the next change does not quietly undo one." },
      { label: "03", title: "DATA_MODEL.md", body: "What is stored, and what each rule protects." },
      { label: "04", title: "SECURITY.md", body: "Who may read and change what, and how that is enforced." },
      { label: "05", title: "CLAUDE.md / AGENTS.md", body: "How your agent should work in this repository." },
      { label: "06", title: ".env.example", body: "The names of every credential. Never the values." },
    ],
    kicker:
      "The subscription rents intelligence. These files capture how your organization wants that intelligence to work. A billion people have the same assistant you do. The edge is what yours is grounded in.",
    footnote: "This repository carries all six. Open it and count.",
  },
  {
    id: "poll-debugging",
    theme: "dark",
    layout: "poll",
    eyebrow: "Poll 1 · single choice",
    title: "The first build works except for one repeatable error.",
    accent: "one repeatable error.",
    lede: "What is the highest-leverage next move?",
    poll: {
      slug: "debugging",
      options: [
        { id: "debugging:a", label: "A", body: "Rewrite the original prompt" },
        { id: "debugging:b", label: "B", body: "Regenerate it in another platform" },
        {
          id: "debugging:c",
          label: "C",
          body: "Provide the error, reproduction steps, and expected behavior; ask the agent to diagnose and test a fix",
        },
        { id: "debugging:d", label: "D", body: "Read every line of code" },
      ],
    },
  },
  {
    id: "authorization",
    theme: "light",
    layout: "split",
    eyebrow: "Build · identity",
    title: "Authentication vs Authorization.",
    accent: "Authorization.",
    split: [
      {
        label: "Authentication",
        title: "Who is the user?",
        body: "Sign-in. Sessions. Usually the first thing built.",
        image: agentB,
      },
      {
        label: "Authorization",
        title: "What can that user read or change?",
        body: "Enforced in the database, not in the interface. Usually the last thing checked.",
        image: failureB,
      },
    ],
    strip: {
      label: "Jordan's rules",
      items: [
        "Users see only their organization's accounts",
        "account owners may update next actions",
        "administrators may manage integrations",
      ],
    },
    kicker: "Hiding records in the interface is not security.",
  },
  {
    id: "breach-test",
    railLabel: "The breach test",
    theme: "dark",
    layout: "claim",
    title: "Sign in as Organization A. Request a record from B. The request must fail.",
    accent: "The request must fail.",
    kicker:
      "If it succeeds, you do not have an access-control bug. You have a data breach with a login screen in front of it.",
    footnote: "This site runs that exact test against its own database — authorization.sql, in public",
    footnoteHref:
      "https://github.com/skidubb/vibecoding-201/blob/main/supabase/tests/authorization.sql",
  },
  {
    id: "secrets",
    theme: "light",
    layout: "cards",
    eyebrow: "Build · secrets",
    title: "Credentials belong outside the code.",
    accent: "outside the code.",
    cards: [
      { label: "01", title: ".env.local", body: "The real values. Never leaves your machine." },
      { label: "02", title: ".env.example", body: "The names only. Safe to commit." },
      { label: "03", title: ".gitignore", body: "The file that keeps the first one out of GitHub." },
    ],
    kicker:
      "The two rules: secrets never belong in GitHub or in browser code. An exposed secret is not a mistake to hide. It must be revoked and rotated.",
  },
  {
    id: "data-doors",
    theme: "light",
    layout: "cards",
    eyebrow: "Build · the data door",
    title: "Five ways to connect to data",
    accent: "Five ways",
    cards: [
      {
        label: "01",
        title: "Manual",
        body: "Rare, ambiguous, or judgment-heavy work.",
        meta: "Stale data and human effort",
      },
      {
        label: "02",
        title: "Computer use",
        body: "A stable interface with no usable integration.",
        meta: "Fragility and terms-of-service limits",
      },
      {
        label: "03",
        title: "API",
        body: "The preferred runtime connection for app-to-app work.",
        meta: "Auth, rate limits, engineering overhead",
      },
      {
        label: "04",
        title: "MCP",
        body: "Governed agent access to tools and context.",
        meta: "Connector quality and permissions",
      },
      {
        label: "05",
        title: "CLI",
        body: "The agent's operating surface for GitHub, Vercel, Supabase, tests, logs.",
        meta: "Powerful access needs strong guardrails",
      },
    ],
    kicker:
      "Choose on frequency · consequence · volume · expected lifetime · stability · retry safety",
  },
  {
    id: "live-data",
    theme: "dark",
    layout: "cards",
    eyebrow: "Build · live data",
    title: "What a live data connection requires",
    accent: "requires",
    cards: [
      { label: "01", title: "Authenticate" },
      { label: "02", title: "Fetch" },
      { label: "03", title: "Store" },
      { label: "04", title: "Normalize" },
      { label: "05", title: "Record status" },
      { label: "06", title: "Expose freshness" },
      { label: "07", title: "Retry safely" },
    ],
    strip: {
      label: "What Jordan's tool must show on screen",
      items: [
        "Last successful sync",
        "current or stale",
        "records processed",
        "records rejected",
        "connection expired",
        "partial failure",
        "retry state",
      ],
    },
    kicker: "This is what makes “failed refreshes look successful” impossible.",
  },
  {
    id: "idempotency",
    theme: "dark",
    layout: "claim",
    eyebrow: "Build · idempotency",
    title: "One question to ask of anything automated.",
    accent: "anything automated.",
    kicker: "What happens if this runs twice?",
    lede: "Imports, webhooks, CRM writes, and scheduled jobs repeat. The system should update an existing record, never create a duplicate. The duplicate stays invisible until a customer finds it.",
  },
  {
    id: "insight-rule",
    theme: "light",
    layout: "split",
    eyebrow: "Build · the AI insight rule",
    title: "What code does, what the model does",
    accent: "the model",
    split: [
      {
        label: "Deterministic code",
        title: "Calculates the metrics",
        body: "The churn score. The thresholds. The ranking. Reproducible, auditable, testable.",
        image: agentB,
      },
      {
        label: "The model",
        title: "Explains, prioritizes, recommends",
        body: "Why this account is flagged. What to do about it. Written in language Jordan can act on.",
        image: agentA,
      },
    ],
    kicker: "The model does not invent the churn score from raw CRM data.",
    footnote: "This is Thursday, repaired.",
  },
  {
    id: "poll-door",
    theme: "dark",
    layout: "poll",
    eyebrow: "Poll 2 · single choice",
    title: "A competitor publishes pricing on a public site with no API.",
    accent: "no API.",
    lede: "Jordan needs a reviewed snapshot every Monday. Most proportionate starting approach?",
    poll: {
      slug: "proportionate-door",
      options: [
        { id: "proportionate-door:a", label: "A", body: "Hire someone to copy it every week" },
        { id: "proportionate-door:b", label: "B", body: "Browser automation with validation and an exception path" },
        { id: "proportionate-door:c", label: "C", body: "Build a custom API" },
        { id: "proportionate-door:d", label: "D", body: "Assume an MCP connector exists" },
      ],
    },
  },
  {
    id: "verification",
    theme: "dark",
    layout: "claim",
    eyebrow: "Test · step 4 of 6",
    title: "A model reporting “all tests pass” is not verification.",
    accent: "not verification.",
    kicker:
      "A passing build loop reduces uncertainty. It does not eliminate judgment. Self-certification is a status report; verification is you watching it work.",
    strip: {
      label: "You still",
      items: [
        "Run the critical workflow",
        "inspect the output",
        "trigger a failure",
        "confirm access controls",
        "confirm stale-data disclosure",
      ],
    },
  },
  {
    id: "build-loop",
    theme: "light",
    layout: "cards",
    eyebrow: "Test · the build loop",
    title: "Who does what in the build loop",
    accent: "build loop",
    cards: [
      { label: "01", title: "Define the behavior", meta: "You" },
      { label: "02", title: "Write the test", meta: "Agent" },
      { label: "03", title: "Confirm it fails", meta: "Agent" },
      { label: "04", title: "Implement", meta: "Agent" },
      { label: "05", title: "Run until green", meta: "Agent" },
      { label: "06", title: "Verify as a user", meta: "You" },
    ],
    strip: {
      label: "Minimum test pack",
      items: [
        "Happy path",
        "unauthorized access",
        "malformed input",
        "duplicate submission",
        "upstream failure",
        "persistence after refresh",
      ],
    },
    kicker: "Six tests, no engineering vocabulary required.",
  },
  {
    id: "demo-fail",
    theme: "dark",
    layout: "cards",
    eyebrow: "Demonstration · window 2 of 3",
    title: "Prove it fails the way you said it would.",
    accent: "fails",
    cards: [
      {
        label: "05",
        title: "The authorization test",
        body: "Signed in as Org A, a request for an Org B record is denied.",
      },
      {
        label: "06",
        title: "The forced failure",
        body: "The integration is broken on purpose; the error state is visible to the user and to the operator.",
      },
    ],
    kicker: "A tool that fails loudly is safer than a tool that fails quietly.",
  },
  {
    id: "ship",
    theme: "light",
    layout: "cards",
    eyebrow: "Ship · step 5 of 6",
    title: "Preview before production.",
    accent: "Preview",
    cards: [
      {
        label: "01",
        title: "Local",
        body: "Where you break things. Nobody sees it. Nothing is at stake.",
      },
      {
        label: "02",
        title: "Preview",
        body: "Where you prove it. A real URL on real infrastructure, visible to nobody but you and your reviewer.",
      },
      {
        label: "03",
        title: "Production",
        body: "Where people depend on it. Promoted deliberately, never by accident.",
      },
    ],
    kicker: "Promotion is a decision someone makes, not a side effect of saving a file.",
  },
  {
    id: "open-the-link",
    railLabel: "Open the link",
    theme: "dark",
    layout: "claim",
    title: "Open the link in the chat. All of you.",
    accent: "All of you.",
    kicker:
      "Real deployment. Real storage. Fictional accounts. Anyone with the link can use it right now.",
    footnote: "The link is this site — cast a vote at /vote",
    footnoteHref: "/vote",
  },
  {
    id: "run",
    theme: "light",
    layout: "cards",
    eyebrow: "Run · step 6 of 6",
    title: "Analytics, logs, and alerts",
    accent: "alerts",
    cards: [
      {
        label: "01",
        title: "Analytics",
        body: "Is it creating value? What users do, how often, and whether the workflow actually completes.",
      },
      {
        label: "02",
        title: "Logs",
        body: "What happened in this run? The record of a specific execution, including the ones that failed.",
      },
      {
        label: "03",
        title: "Alerts",
        body: "Who needs to intervene? A named human. A log entry is not an alert.",
      },
    ],
    strip: {
      items: [
        "retention_review_opened",
        "sync_completed",
        "next_action_updated",
        "workflow_failed",
      ],
    },
    kicker: "Usage feeds the next spec. Run is where value compounds.",
  },
  {
    id: "ownership",
    theme: "dark",
    layout: "cards",
    eyebrow: "Run · ownership",
    title: "Ownership means the tool survives the person who built it",
    accent: "survives the person who built it",
    cards: [
      { label: "01", title: "A named owner" },
      { label: "02", title: "A backup owner" },
      { label: "03", title: "A rollback path" },
      { label: "04", title: "Known limitations" },
      { label: "05", title: "A review date" },
      { label: "06", title: "A shutdown path" },
    ],
    kicker:
      "Planning how a tool ends costs an afternoon. Skipping it is how a working tool becomes somebody's unpaid second job.",
    footnote: "This repository has an OWNERSHIP.md. Two of its six items are still marked undecided, in public.",
  },
  {
    id: "decision-rule",
    theme: "light",
    layout: "cards",
    eyebrow: "The decision rule",
    title: "The decision, and the loop that follows",
    accent: "the loop that follows",
    lede: "Worth building? → Spec → Plan → Build → Test → Ship → Run",
    cards: [
      { label: "01", title: "Build", body: "A narrow internal tool." },
      { label: "02", title: "Buy", body: "When something mature already solves 80%." },
      { label: "03", title: "Delegate", body: "The build or the productionization." },
      { label: "04", title: "Stop", body: "When the prototype proved it is not worth operating." },
    ],
    kicker:
      "The agent generates the implementation. You own the architecture, the evidence, the release decision, and the consequences.",
  },
  {
    id: "homework",
    theme: "dark",
    layout: "cards",
    eyebrow: "Homework",
    title: "Ship one narrow internal tool. Real user, real URL.",
    accent: "Real user, real URL.",
    cards: [
      { label: "01", title: "Your three-line specification", body: "Job, User, and a Done someone else could check." },
      { label: "02", title: "The live link", body: "Or a recorded walkthrough of the workflow." },
      { label: "03", title: "One known limitation", body: "The item that proves you actually verified it." },
    ],
    kicker:
      "You don't cross this by becoming an engineer. You cross it by knowing which work you are not doing, and directing it.",
  },
  {
    id: "poll-priya",
    theme: "dark",
    layout: "poll",
    eyebrow: "Q&A opener · single choice",
    title: "What is the right call?",
    accent: "right call?",
    footnote:
      "Priya, Head of Partnerships, built a partner deal-registration app in Lovable on Sunday. Sample data, no sign-in, looks fantastic. She wants to send the link to 40 partners on Monday.",
    poll: {
      slug: "priya",
      options: [
        { id: "priya:a", label: "A", body: "Ship it; it is only 40 partners" },
        { id: "priya:b", label: "B", body: "Polish the interface first" },
        { id: "priya:c", label: "C", body: "Hold. It needs real storage, controlled access, and a review before anything external-facing ships" },
        { id: "priya:d", label: "D", body: "Rebuild it from scratch in the terminal" },
      ],
    },
  },
  {
    id: "the-bar",
    theme: "light",
    layout: "cards",
    eyebrow: "The bar",
    title: "A production standard.",
    accent: "production standard.",
    lede: "If a tool misses one of these, it is not ready for people to depend on it. This site is scored against all nine, and every link goes to the thing itself in a public repository — including the one it does not meet.",
    cards: [
      {
        label: "01",
        title: "Persistent data",
        body: "Postgres, with the schema in version control rather than clicked into a dashboard.",
        href: "https://github.com/skidubb/vibecoding-201/tree/main/supabase/migrations",
      },
      {
        label: "02",
        title: "Sign-in",
        body: "Google, plus anonymous sessions so a vote never waits on an inbox.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/src/app/signin/page.tsx",
      },
      {
        label: "03",
        title: "Enforced authorization",
        body: "Fifteen row-level policies, and the deck's own cross-tenant test run against them.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/supabase/tests/authorization.sql",
      },
      {
        label: "04",
        title: "Server-side secrets",
        body: "Names committed, values never. No service-role key exists anywhere in this app.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/.env.example",
      },
      {
        label: "05",
        title: "A tested critical workflow",
        body: "Sixteen browser specs and seventeen live assertions against the real database.",
        href: "https://github.com/skidubb/vibecoding-201/tree/main/tests",
      },
      {
        label: "06",
        title: "Visible error states",
        body: "Every failure path is a test: no backend, no clipboard, a refused vote.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/tests/upstream-failure.spec.ts",
      },
      {
        label: "07",
        title: "Logs and analytics",
        body: "An events table the site writes to, readable without exposing who did what.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/src/lib/events.ts",
      },
      {
        label: "08",
        title: "Preview before production",
        body: "Both gates run on every pull request, and every branch gets its own URL.",
        href: "https://github.com/skidubb/vibecoding-201/actions",
      },
      {
        label: "09",
        title: "A named owner",
        body: "Named, with a rollback path. Backup owner, review date and shutdown path are still undecided — and say so in public rather than sitting blank.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/OWNERSHIP.md",
        met: false,
      },
    ],
    kicker:
      "Eight and a half. The half is deliberate: a standard you always score full marks against is a standard you are not really applying.",
  },
  {
    id: "qa",
    theme: "dark",
    layout: "cards",
    eyebrow: "30 minutes",
    title: "Questions.",
    accent: "Questions.",
    cards: [
      { label: "01", title: "Should this cross?", body: "Rung, frequency, consequence, owner." },
      { label: "02", title: "How do I specify it?", body: "Job, user, checkable Done, non-goals." },
      { label: "03", title: "How should it connect?", body: "The proportionate data door." },
      { label: "04", title: "How is it verified?", body: "Workflow run, failure states, review gate." },
    ],
    footnote: "Scott Ewalt · Cardinal Element · scott.e.ewalt@gmail.com",
  },
  {
    id: "close",
    railLabel: "The close",
    theme: "dark",
    layout: "cta",
    title: "Ship something small. Make sure it gets used.",
    accent: "Make sure it gets used.",
    lede: "Pick one workflow. Give it a job, a memory, and a way in. Ship it before the next session.",
    kicker: "Scott Ewalt · Cardinal Element",
    media: { image: agentA, speed: -0.16 },
  },
];
