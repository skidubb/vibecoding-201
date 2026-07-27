import type { StaticImageData } from "next/image";

import threshold from "@/assets/threshold.webp";
import recordRefreshA from "@/assets/record-refresh-a.webp";
import recordRefreshB from "@/assets/record-refresh-b.webp";
import opsRoomA from "@/assets/ops-room-a.webp";
import opsRoomB from "@/assets/ops-room-b.webp";
import opsRoomC from "@/assets/ops-room-c.webp";
import operatorsGroup from "@/assets/operators-group.webp";
import agentA from "@/assets/agent-a.webp";
import failureA from "@/assets/failure-a.webp";
import failureB from "@/assets/failure-b.webp";
import agentB from "@/assets/agent-b.webp";

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
  | "poll";

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
  body: string;
  image?: StaticImageData;
  tone?: "neutral" | "bad";
};

/** One answer in a poll. `id` matches poll_options.id in Postgres. */
export type PollOption = { id: string; label: string; body: string };

/**
 * A live poll. The registry carries the question and the options and nothing
 * else — the correct answer and the debrief live in Postgres behind a column
 * grant, because this file is imported by client code and everything in it
 * ships to the browser.
 */
export type Poll = { slug: string; options: PollOption[] };

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
  /** Display number in the rail — mirrors the source deck's slide numbering. */
  slide: string;
  theme: "dark" | "light";
  layout: LayoutKind;
  eyebrow?: string;
  title: string;
  /** Words to render in magenta inside the title. */
  accent?: string;
  lede?: string;
  kicker?: string;
  footnote?: string;
  media?: Media;
  cards?: Card[];
  timeline?: TimelineStop[];
  chart?: "ladder" | "scurve" | "gap";
  split?: { label: string; title: string; body: string; image: StaticImageData }[];
  loopSteps?: string[];
  prompts?: Prompt[];
  links?: LinkRef[];
  poll?: Poll;
};

export const sections: Section[] = [
  {
    id: "title",
    slide: "01",
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
    slide: "02",
    theme: "dark",
    layout: "split",
    eyebrow: "Cold open",
    title: "Two identical screens. Radically different value.",
    accent: "Radically different value.",
    lede: "Which one would you trust to run Monday's retention meeting? Vote in the chat.",
    split: [
      {
        label: "Screen A",
        title: "The demo",
        body: "Built in 12 minutes. Sample data. Open link.",
        image: recordRefreshA,
      },
      {
        label: "Screen B",
        title: "The tool",
        body: "Stores real records, controls access, refreshes itself, logs failures.",
        image: recordRefreshB,
      },
    ],
  },
  {
    id: "claim",
    slide: "03",
    theme: "dark",
    layout: "claim",
    eyebrow: "The opening claim",
    title: "AI made the visible part of software cheap. Most of the value, and most of the risk, is invisible.",
    accent: "is invisible.",
    kicker: "Code is no longer the primary bottleneck. Judgment is.",
  },
  {
    id: "promise",
    slide: "04",
    theme: "light",
    layout: "cards",
    eyebrow: "The promise",
    title: "101 made you dangerous. 201 makes you useful.",
    accent: "201 makes you useful.",
    lede: "You do not need 101. Assume only that plain English can now produce working software. Today is everything required after the first impressive result.",
    kicker: "You will leave able to",
    cards: [
      { label: "01", title: "Diagnose why a prototype will die before you invest further" },
      { label: "02", title: "Write a spec precise enough to test, without writing code" },
      { label: "03", title: "Direct an agent through plan, build, debug, and verification" },
      { label: "04", title: "Choose the least complex reliable way to connect real data" },
      { label: "05", title: "Engineer the two loops that run without you" },
      { label: "06", title: "Hand a working tool to someone else and have it survive" },
    ],
  },
  {
    id: "jordan",
    slide: "05",
    theme: "light",
    layout: "timeline",
    eyebrow: "The running case · Jordan, VP RevOps",
    title: "The week Jordan's prototype died",
    accent: "died",
    lede: "A prioritized view of accounts at risk, the evidence behind each flag, the owner, and the next action. The data lives in CRM, support, product usage, and a spreadsheet Customer Success keeps by hand.",
    timeline: [
      {
        day: "Sunday",
        title: "The build",
        body: "Built a polished dashboard with sample data.",
        image: opsRoomA,
      },
      {
        day: "Monday",
        title: "The applause",
        body: "Leadership loved the demo.",
        image: opsRoomB,
      },
      {
        day: "Tuesday",
        title: "The ask",
        body: "The team asked for logins and real accounts.",
        tone: "bad",
      },
      {
        day: "Wednesday",
        title: "The reset",
        body: "The data disappeared after a refresh.",
        tone: "bad",
        image: opsRoomC,
      },
      {
        day: "Thursday",
        title: "The black box",
        body: "Nobody could explain a risk score.",
        tone: "bad",
      },
      {
        day: "Friday",
        title: "The return",
        body: "The spreadsheet returned.",
        tone: "bad",
      },
    ],
  },
  {
    id: "ladder",
    slide: "06",
    theme: "dark",
    layout: "chart",
    chart: "ladder",
    eyebrow: "The ladder",
    title: "Belief, then work, then the business.",
    accent: "then the business.",
    kicker: "The rung is set by the observable test, never by the feature list.",
    media: {
      video: "/media/three-environments.mp4",
      poster: "/media/three-environments-poster.jpg",
      speed: -0.12,
    },
  },
  {
    id: "production-gate",
    slide: "08",
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
    slide: "09",
    theme: "dark",
    layout: "claim",
    eyebrow: "Permission",
    title: "Most prototypes should die at the gate.",
    accent: "die at the gate.",
    kicker:
      "A prototype that proves an idea is not worth operating saves you every hour you would have spent maintaining it. I have never seen anyone celebrate that.",
  },
  {
    id: "the-loop",
    slide: "18",
    theme: "dark",
    layout: "loop",
    eyebrow: "The 201 loop",
    title: "This is how you work.",
    accent: "you",
    loopSteps: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
    lede: "It replaces “prompt until something looks right.” Every step has an artifact you can show someone.",
    kicker:
      "Two more loops live inside this one. The build loop runs while the agent builds. The run loop runs after you ship.",
    media: {
      video: "/media/workflow-loop.mp4",
      poster: "/media/workflow-loop-poster.jpg",
      speed: -0.1,
    },
  },
  {
    id: "spec",
    slide: "12",
    theme: "light",
    layout: "split",
    eyebrow: "Spec · the key move",
    title: "Say how you will check it.",
    accent: "how you will check it.",
    lede: "A prompt has no downstream. A spec is an artifact the next step reads — versioned on purpose, and testable by someone who is not you.",
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
        body: "Anyone can follow those steps and get the same answer — you, the person who asked for it, and the agent while it is building.",
        image: recordRefreshB,
      },
    ],
    kicker:
      "If you cannot write the steps, you do not yet know what you are asking for.",
  },
  {
    id: "harness",
    slide: "19",
    theme: "dark",
    layout: "cards",
    eyebrow: "Build · the harness",
    title: "Six files to keep in the repository.",
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
      "The subscription rents intelligence. These files capture how your organization wants that intelligence to work — and they move with you when the model of the month changes.",
    footnote: "This repository carries all six. Open it and count.",
  },
  {
    id: "authorization",
    slide: "21",
    theme: "light",
    layout: "split",
    eyebrow: "Build · identity",
    title: "Authentication is not authorization.",
    accent: "not authorization.",
    lede: "One asks who the user is. The other asks what that user may read or change — and it is enforced in the database, not in the interface.",
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
    kicker:
      "Sign in as one organization, request a record from another. The request must fail. If it succeeds you do not have an access-control bug — you have a data breach with a login screen in front of it.",
  },
  {
    id: "poll-debugging",
    slide: "20",
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
    id: "director-mode",
    slide: "14",
    theme: "light",
    layout: "prompt",
    eyebrow: "Plan · step 2 of 6",
    title: "Approve the plan before any code changes.",
    accent: "before any code changes.",
    lede: "You are not pretending to be an engineer. You are directing AI as your engineer — which moves the expertise from typing syntax to defining, testing, and judging the work.",
    prompts: [
      {
        id: "plan-approval",
        label: "The plan prompt",
        text: "Inspect the current project. Propose the smallest coherent implementation for this specification. Identify the data model, permissions, environment variables, failure states, tests, and files involved. Do not change anything until I approve the plan.",
        caption:
          "The last sentence is the whole prompt. Without it the agent writes code you then have to review; with it, the artifact you review is a plan, which is far cheaper to change.",
      },
      {
        id: "branch-and-pr",
        label: "The delegation prompt",
        text: "Create a branch, make the approved change, run the tests, summarize the diff, and open a draft pull request. Do not merge it.",
        caption:
          "GitHub is the layer most GTM leaders have never touched. This prompt means you never have to — the agent drives it, and you review the diff.",
      },
    ],
    links: [
      {
        label: "GitHub Spec Kit",
        href: "https://github.com/github/spec-kit",
        note: "124K+ stars. Each phase produces an artifact that feeds the next.",
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
      "Five questions to ask of any plan: does it solve the stated job, what did it invent, what data and permissions does it need, how will the workflow be tested, and what is deliberately excluded?",
  },
  {
    id: "data-doors",
    slide: "24",
    theme: "light",
    layout: "cards",
    eyebrow: "Build · the data door",
    title: "Five ways to connect to data.",
    accent: "Five ways",
    lede: "Situational choices, not a hierarchy. Choose on frequency, consequence, volume, expected lifetime, stability, and retry safety.",
    cards: [
      { label: "01", title: "Manual", body: "Rare, ambiguous, or judgment-heavy work.", meta: "Costs: stale data and human effort" },
      { label: "02", title: "Computer use", body: "A stable interface with no usable integration.", meta: "Costs: fragility and terms-of-service limits" },
      { label: "03", title: "API", body: "The preferred runtime connection for app-to-app work.", meta: "Costs: auth, rate limits, engineering overhead" },
      { label: "04", title: "MCP", body: "Governed agent access to tools and context.", meta: "Costs: connector quality and permissions" },
      { label: "05", title: "CLI", body: "The agent's operating surface for GitHub, Vercel, Supabase, tests, logs.", meta: "Costs: powerful access needs strong guardrails" },
    ],
    kicker:
      "Your agent already speaks every CLI, so that door costs nothing to open. The question is never which is best — it is which is proportionate.",
  },
  {
    id: "poll-door",
    slide: "28",
    theme: "dark",
    layout: "poll",
    eyebrow: "Poll 2 · single choice",
    title: "Which door is proportionate here?",
    accent: "proportionate here?",
    footnote:
      "A competitor publishes pricing on a public site with no API. Jordan needs a reviewed snapshot every Monday.",
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
    id: "idempotency",
    slide: "26",
    theme: "dark",
    layout: "claim",
    eyebrow: "Build · idempotency",
    title: "What happens if this runs twice?",
    accent: "runs twice?",
    kicker:
      "Imports, webhooks, CRM writes, and scheduled jobs all repeat. The system should update an existing record, never create a duplicate — and the duplicate stays invisible until a customer finds it.",
  },
  {
    id: "run",
    slide: "34",
    theme: "light",
    layout: "cards",
    eyebrow: "Run · step 6 of 6",
    title: "Analytics, logs, and alerts answer different questions.",
    accent: "different questions.",
    cards: [
      { label: "01", title: "Analytics", body: "Is it creating value? What users do, how often, and whether the workflow actually completes." },
      { label: "02", title: "Logs", body: "What happened in this run? The record of a specific execution, including the ones that failed." },
      { label: "03", title: "Alerts", body: "Who needs to intervene? A named human. A log entry is not an alert." },
    ],
    kicker: "Usage feeds the next spec. Run is where value compounds.",
  },
  {
    id: "ownership",
    slide: "35",
    theme: "light",
    layout: "cards",
    eyebrow: "Run · ownership",
    title: "Ownership means the tool survives the person who built it.",
    accent: "survives the person who built it.",
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
    id: "poll-priya",
    slide: "39",
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
    slide: "40",
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
    id: "homework",
    slide: "37",
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
    id: "close",
    slide: "43",
    theme: "dark",
    layout: "cta",
    eyebrow: "The assignment",
    title: "Small is fine. Ugly is survivable. Unused is failure.",
    accent: "Unused is failure.",
    lede: "Pick one workflow. Give it a job, a memory, and a way in. Ship it before the next session.",
    kicker: "Scott Ewalt · Cardinal Element",
    media: { image: agentA, speed: -0.16 },
  },
];
