import type { StaticImageData } from "next/image";
import type { BrandKey } from "@/components/layouts/Logo";

import threshold from "@/assets/threshold.webp";
import recordRefreshB from "@/assets/record-refresh-b.webp";
import opsRoomA from "@/assets/ops-room-a.webp";
import opsRoomB from "@/assets/ops-room-b.webp";
import opsRoomC from "@/assets/ops-room-c.webp";
import agentA from "@/assets/agent-a.webp";
import agentB from "@/assets/agent-b.webp";
import failureB from "@/assets/failure-b.webp";

import genS01Doorway from "@/assets/generated/s01-doorway.webp";
import genS02bTwoDoors from "@/assets/generated/s02b-two-doors.webp";
import genS03UnderTheDesk from "@/assets/generated/s03-under-the-desk.webp";
import genS04Monday from "@/assets/generated/s04-monday.webp";
import genS05SixNotes from "@/assets/generated/s05-six-notes.webp";
import genS07Turnstile from "@/assets/generated/s07-turnstile.webp";
import genS08LightsOut from "@/assets/generated/s08-lights-out.webp";
import genS10PagePassed from "@/assets/generated/s10-page-passed.webp";
import genS11TwoSheets from "@/assets/generated/s11-two-sheets.webp";
import genS12Timer from "@/assets/generated/s12-timer.webp";
import genS13HoveringPen from "@/assets/generated/s13-hovering-pen.webp";
import genS14TheQuestion from "@/assets/generated/s14-the-question.webp";
import genS15Relay from "@/assets/generated/s15-relay.webp";
import genS16ThreeDrawers from "@/assets/generated/s16-three-drawers.webp";
import genS17OverShoulder from "@/assets/generated/s17-over-shoulder.webp";
import genS18SixBinders from "@/assets/generated/s18-six-binders.webp";
import genS19HandsUp from "@/assets/generated/s19-hands-up.webp";
import genS20Badge from "@/assets/generated/s20-badge.webp";
import genS21WrongSide from "@/assets/generated/s21-wrong-side.webp";
import genS22SealedEnvelope from "@/assets/generated/s22-sealed-envelope.webp";
import genS23FiveEntrances from "@/assets/generated/s23-five-entrances.webp";
import genS24StatusBoard from "@/assets/generated/s24-status-board.webp";
import genS25TwoParcels from "@/assets/generated/s25-two-parcels.webp";
import genS26LedgerAndNote from "@/assets/generated/s26-ledger-and-note.webp";
import genS27HandsUp2 from "@/assets/generated/s27-hands-up-2.webp";
import genS28GreenLights from "@/assets/generated/s28-green-lights.webp";
import genS29RelayHands from "@/assets/generated/s29-relay-hands.webp";
import genS30Unplugging from "@/assets/generated/s30-unplugging.webp";
import genS31ThreeDoors from "@/assets/generated/s31-three-doors.webp";
import genS32ManyPhones from "@/assets/generated/s32-many-phones.webp";
import genS33WallDisplay from "@/assets/generated/s33-wall-display.webp";
import genS34Nameplate from "@/assets/generated/s34-nameplate.webp";
import genS35RingWithGate from "@/assets/generated/s35-ring-with-gate.webp";
import genS36ThreeLines from "@/assets/generated/s36-three-lines.webp";
import genS37OneObject from "@/assets/generated/s37-one-object.webp";
import genS38AboutToSend from "@/assets/generated/s38-about-to-send.webp";
import genS39NineItems from "@/assets/generated/s39-nine-items.webp";
import genS40Council from "@/assets/generated/s40-council.webp";

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
  | "exercise"
  | "pipeline";

export type Media = {
  image?: StaticImageData;
  video?: string;
  poster?: string;
  /** -1 … 1. Negative drifts up as you scroll down (further away). */
  speed?: number;
};

export type Card = {
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
  /** A brand mark for the card, where the deck names a product. */
  brand?: BrandKey;
  /**
   * What this site actually did at this step.
   *
   * Only on the pipeline, and load-bearing there: the stack slide recommends
   * six tools, and a receipt under each is the difference between a
   * recommendation and a demonstration. It is also where the slide has to
   * admit that this site skipped step one.
   */
  receipt?: string;
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
    media: { image: genS01Doorway, speed: -0.18 },
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
    media: { image: genS02bTwoDoors, speed: -0.12 },
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
    media: { image: genS03UnderTheDesk, speed: -0.15 },
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
    media: { image: genS04Monday, speed: -0.18 },
  },
  {
    id: "six-defects",
    theme: "dark",
    layout: "cards",
    eyebrow: "The promise of the next hour",
    title: "The six defects we will repair",
    accent: "six defects",
    cards: [
      { title: "Data disappears after refresh", meta: "Build · persistence" },
      { title: "No sign-in or access control", meta: "Build · identity" },
      { title: "The CRM connection is manual", meta: "Build · the data door" },
      { title: "Failed refreshes look successful", meta: "Build · the freshness surface" },
      { title: "Nobody can explain the risk score", meta: "Build · the AI insight rule" },
      { title: "Only Jordan knows how it works", meta: "Run · ownership" },
    ],
    kicker: "The last three fail silently. That is what makes them expensive.",
    media: { image: genS05SixNotes, speed: -0.12 },
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
      { title: "Is the workflow frequent or consequential enough to matter?" },
      { title: "Is the process stable enough to encode?" },
      { title: "Is there a named user, outcome, and owner?" },
      { title: "What new risk appears when others depend on it?" },
    ],
    kicker:
      "Most prototypes should die here. That is the system working, not a waste.",
    media: { image: genS07Turnstile, speed: -0.15 },
  },
  {
    id: "should-die",
    railLabel: "Permission to stop",
    theme: "dark",
    layout: "claim",
    title: "Most prototypes should die at the gate.",
    accent: "die at the gate.",
    kicker:
      "Prototypes have clear value, keep building them. But, not every prototype needs to be a hardened system. Pressure test ideas to ensure they have value at scale.",
    media: { image: genS08LightsOut, speed: -0.18 },
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
        title: "Job",
        body: "Every Monday, identify the ten accounts most at risk of churn and show the evidence behind each flag.",
      },
      {
        title: "User",
        body: "The VP of RevOps and the assigned account owner.",
      },
      {
        title: "Done",
        body: "A user can sign in, load current records, understand every flag, update the next action, refresh, and confirm the change persists.",
      },
    ],
    kicker:
      "Four constraints go underneath, not in the mnemonic: source data, access rules, failure behavior, non-goals.",
    footnote:
      "This is the premise of GitHub Spec Kit (106K+ stars, 200+ contributors): each phase produces an artifact that feeds the next, instead of ad-hoc prompts.",
    media: { image: genS10PagePassed, speed: -0.12 },
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
    media: { image: genS11TwoSheets, speed: -0.15 },
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
        title: "Job",
        body: "One narrow recurring GTM workflow. Start with a verb: identify, prepare, route, reconcile, summarize, approve.",
      },
      {
        title: "User",
        body: "Who performs it, and what are they allowed to change?",
      },
      {
        title: "Done",
        body: "A check another person could run. Not a feeling.",
      },
    ],
    kicker:
      "Then add one access rule, one failure state, one non-goal. Put it in the chat. I will read two aloud and tighten them live.",
    media: { image: genS12Timer, speed: -0.18 },
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
    media: { image: genS13HoveringPen, speed: -0.12 },
  },
  {
    id: "plan-questions",
    theme: "dark",
    layout: "cards",
    eyebrow: "Plan · your job during the demo",
    title: "Five questions to ask of any plan.",
    accent: "Five questions",
    cards: [
      { title: "Does it solve the stated job?" },
      { title: "What assumptions did it invent?" },
      { title: "What data and permissions does it require?" },
      { title: "How will the core workflow be tested?" },
      { title: "What is deliberately excluded?" },
    ],
    kicker: "Approve or revise. Then let it implement one bounded capability.",
    media: { image: genS14TheQuestion, speed: -0.15 },
  },
  {
    id: "build-stack",
    theme: "light",
    layout: "pipeline",
    eyebrow: "Build · step 3 of 6",
    title: "Recommended build stack and minimum standard",
    accent: "minimum standard",
    cards: [
      {
        title: "Lovable or Artifact",
        brand: "lovable",
        receipt: "This site skipped it — create-next-app, then a written spec.",
      },
      {
        title: "GitHub",
        brand: "github",
        receipt: "skidubb/vibecoding-201, public, every commit readable.",
      },
      {
        title: "Claude Code or Codex",
        brand: "claude",
        receipt: "Claude Code, working from an approved plan.",
      },
      {
        title: "Supabase",
        brand: "supabase",
        receipt: "Six migrations. Row-level security on every table.",
      },
      {
        title: "Vercel preview",
        brand: "vercel",
        receipt: "Every push builds one before production sees it.",
      },
      {
        title: "Production",
        brand: "vercel",
        receipt: "The page you are reading.",
      },
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
    media: { image: genS15Relay, speed: -0.18 },
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
        title: "GitHub",
        brand: "github",
        body: "The system of record for the application and its changes.",
        meta: "repository · branch · pull request · merge",
      },
      {
        title: "Supabase",
        body: "Persistence and permission.",
        meta: "Postgres · auth · row-level security · server functions · scheduled work",
      },
      {
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
    media: { image: genS16ThreeDrawers, speed: -0.12 },
  },
  {
    id: "demo-inspect",
    theme: "light",
    layout: "cards",
    eyebrow: "Demonstration · window 1 of 3",
    title: "The demo, in four steps",
    accent: "four steps",
    cards: [
      { title: "The repository", body: "The Lovable project, already in GitHub." },
      { title: "The inspection", body: "The agent reads the project before acting." },
      { title: "The plan", body: "Proposed before any file changes. You approve it." },
      { title: "One persistent action", body: "Written to Supabase, survives a refresh." },
    ],
    kicker:
      "Narrate evidence, not keystrokes: what files changed, what it inferred, what I still have to inspect myself.",
    media: { image: genS17OverShoulder, speed: -0.15 },
  },
  {
    id: "harness",
    theme: "dark",
    layout: "cards",
    eyebrow: "Build · the harness",
    title: "Six files to keep in the repository",
    accent: "Six files",
    cards: [
      { title: "PRODUCT.md", body: "What this is, who it serves, and what it deliberately does not do." },
      { title: "ARCHITECTURE.md", body: "The decisions and why, so the next change does not quietly undo one." },
      { title: "DATA_MODEL.md", body: "What is stored, and what each rule protects." },
      { title: "SECURITY.md", body: "Who may read and change what, and how that is enforced." },
      { title: "CLAUDE.md / AGENTS.md", body: "How your agent should work in this repository." },
      { title: ".env.example", body: "The names of every credential. Never the values." },
    ],
    kicker:
      "The subscription rents intelligence. These files capture how your organization wants that intelligence to work. A billion people have the same assistant you do. The edge is what yours is grounded in.",
    footnote: "This repository carries all six. Open it and count.",
    media: { image: genS18SixBinders, speed: -0.18 },
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
    media: { image: genS19HandsUp, speed: -0.12 },
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
    media: { image: genS20Badge, speed: -0.15 },
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
    media: { image: genS21WrongSide, speed: -0.18 },
  },
  {
    id: "secrets",
    theme: "light",
    layout: "cards",
    eyebrow: "Build · secrets",
    title: "Credentials belong outside the code.",
    accent: "outside the code.",
    cards: [
      { title: ".env.local", body: "The real values. Never leaves your machine." },
      { title: ".env.example", body: "The names only. Safe to commit." },
      { title: ".gitignore", body: "The file that keeps the first one out of GitHub." },
    ],
    kicker:
      "The two rules: secrets never belong in GitHub or in browser code. An exposed secret is not a mistake to hide. It must be revoked and rotated.",
    media: { image: genS22SealedEnvelope, speed: -0.12 },
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
        title: "Manual",
        body: "Rare, ambiguous, or judgment-heavy work.",
        meta: "Stale data and human effort",
      },
      {
        title: "Computer use",
        body: "A stable interface with no usable integration.",
        meta: "Fragility and terms-of-service limits",
      },
      {
        title: "API",
        body: "The preferred runtime connection for app-to-app work.",
        meta: "Auth, rate limits, engineering overhead",
      },
      {
        title: "MCP",
        brand: "mcp",
        body: "Governed agent access to tools and context.",
        meta: "Connector quality and permissions",
      },
      {
        title: "CLI",
        brand: "github",
        body: "The agent's operating surface for GitHub, Vercel, Supabase, tests, logs.",
        meta: "Powerful access needs strong guardrails",
      },
    ],
    kicker:
      "Choose on frequency · consequence · volume · expected lifetime · stability · retry safety",
    media: { image: genS23FiveEntrances, speed: -0.15 },
  },
  {
    id: "live-data",
    theme: "dark",
    layout: "cards",
    eyebrow: "Build · live data",
    title: "What a live data connection requires",
    accent: "requires",
    cards: [
      { title: "Authenticate" },
      { title: "Fetch" },
      { title: "Store" },
      { title: "Normalize" },
      { title: "Record status" },
      { title: "Expose freshness" },
      { title: "Retry safely" },
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
    media: { image: genS24StatusBoard, speed: -0.18 },
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
    media: { image: genS25TwoParcels, speed: -0.12 },
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
    media: { image: genS26LedgerAndNote, speed: -0.15 },
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
    media: { image: genS27HandsUp2, speed: -0.18 },
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
    media: { image: genS28GreenLights, speed: -0.12 },
  },
  {
    id: "build-loop",
    theme: "light",
    layout: "cards",
    eyebrow: "Test · the build loop",
    title: "Who does what in the build loop",
    accent: "build loop",
    cards: [
      { title: "Define the behavior", meta: "You" },
      { title: "Write the test", meta: "Agent" },
      { title: "Confirm it fails", meta: "Agent" },
      { title: "Implement", meta: "Agent" },
      { title: "Run until green", meta: "Agent" },
      { title: "Verify as a user", meta: "You" },
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
    media: { image: genS29RelayHands, speed: -0.15 },
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
        title: "The authorization test",
        body: "Signed in as Org A, a request for an Org B record is denied.",
      },
      {
        title: "The forced failure",
        body: "The integration is broken on purpose; the error state is visible to the user and to the operator.",
      },
    ],
    kicker: "A tool that fails loudly is safer than a tool that fails quietly.",
    media: { image: genS30Unplugging, speed: -0.18 },
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
        title: "Local",
        body: "Where you break things. Nobody sees it. Nothing is at stake.",
      },
      {
        title: "Preview",
        body: "Where you prove it. A real URL on real infrastructure, visible to nobody but you and your reviewer.",
      },
      {
        title: "Production",
        body: "Where people depend on it. Promoted deliberately, never by accident.",
      },
    ],
    kicker: "Promotion is a decision someone makes, not a side effect of saving a file.",
    media: { image: genS31ThreeDoors, speed: -0.12 },
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
    media: { image: genS32ManyPhones, speed: -0.15 },
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
        title: "Analytics",
        body: "Is it creating value? What users do, how often, and whether the workflow actually completes.",
      },
      {
        title: "Logs",
        body: "What happened in this run? The record of a specific execution, including the ones that failed.",
      },
      {
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
    media: { image: genS33WallDisplay, speed: -0.18 },
  },
  {
    id: "ownership",
    theme: "dark",
    layout: "cards",
    eyebrow: "Run · ownership",
    title: "Ownership means the tool survives the person who built it",
    accent: "survives the person who built it",
    cards: [
      { title: "A named owner" },
      { title: "A backup owner" },
      { title: "A rollback path" },
      { title: "Known limitations" },
      { title: "A review date" },
      { title: "A shutdown path" },
    ],
    kicker:
      "Planning how a tool ends costs an afternoon. Skipping it is how a working tool becomes somebody's unpaid second job.",
    footnote: "This repository has an OWNERSHIP.md. Two of its six items are still marked undecided, in public.",
    media: { image: genS34Nameplate, speed: -0.12 },
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
      { title: "Build", body: "A narrow internal tool." },
      { title: "Buy", body: "When something mature already solves 80%." },
      { title: "Delegate", body: "The build or the productionization." },
      { title: "Stop", body: "When the prototype proved it is not worth operating." },
    ],
    kicker:
      "The agent generates the implementation. You own the architecture, the evidence, the release decision, and the consequences.",
    media: { image: genS35RingWithGate, speed: -0.15 },
  },
  {
    id: "homework",
    theme: "dark",
    layout: "cards",
    eyebrow: "Homework",
    title: "Ship one narrow internal tool. Real user, real URL.",
    accent: "Real user, real URL.",
    cards: [
      { title: "Your three-line specification", body: "Job, User, and a Done someone else could check." },
      { title: "The live link", body: "Or a recorded walkthrough of the workflow." },
      { title: "One known limitation", body: "The item that proves you actually verified it." },
    ],
    kicker:
      "You don't cross this by becoming an engineer. You cross it by knowing which work you are not doing, and directing it.",
    footnote: "The kit — checklist, prompt pack, agent instructions, ownership card, CLI reference — is at /kit. No email required.",
    footnoteHref: "/kit",
    media: { image: genS36ThreeLines, speed: -0.18 },
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
    media: { image: genS38AboutToSend, speed: -0.12 },
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
        title: "Persistent data",
        body: "Postgres, with the schema in version control rather than clicked into a dashboard.",
        href: "https://github.com/skidubb/vibecoding-201/tree/main/supabase/migrations",
      },
      {
        title: "Sign-in",
        body: "Google, plus anonymous sessions so a vote never waits on an inbox.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/src/app/signin/page.tsx",
      },
      {
        title: "Enforced authorization",
        body: "Fifteen row-level policies, and the deck's own cross-tenant test run against them.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/supabase/tests/authorization.sql",
      },
      {
        title: "Server-side secrets",
        body: "Names committed, values never. No service-role key exists anywhere in this app.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/.env.example",
      },
      {
        title: "A tested critical workflow",
        body: "Sixteen browser specs and seventeen live assertions against the real database.",
        href: "https://github.com/skidubb/vibecoding-201/tree/main/tests",
      },
      {
        title: "Visible error states",
        body: "Every failure path is a test: no backend, no clipboard, a refused vote.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/tests/upstream-failure.spec.ts",
      },
      {
        title: "Logs and analytics",
        body: "An events table the site writes to, readable without exposing who did what.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/src/lib/events.ts",
      },
      {
        title: "Preview before production",
        body: "Both gates run on every pull request, and every branch gets its own URL.",
        href: "https://github.com/skidubb/vibecoding-201/actions",
      },
      {
        title: "A named owner",
        body: "Named, with a rollback path. Backup owner, review date and shutdown path are still undecided — and say so in public rather than sitting blank.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/OWNERSHIP.md",
        met: false,
      },
    ],
    kicker:
      "Eight and a half. The half is deliberate: a standard you always score full marks against is a standard you are not really applying.",
    media: { image: genS39NineItems, speed: -0.15 },
  },
  {
    id: "qa",
    theme: "dark",
    layout: "cards",
    eyebrow: "30 minutes",
    title: "Questions.",
    accent: "Questions.",
    cards: [
      { title: "Should this cross?", body: "Rung, frequency, consequence, owner." },
      { title: "How do I specify it?", body: "Job, user, checkable Done, non-goals." },
      { title: "How should it connect?", body: "The proportionate data door." },
      { title: "How is it verified?", body: "Workflow run, failure states, review gate." },
    ],
    footnote: "Scott Ewalt · Cardinal Element · scott@cardinalelement.com",
    footnoteHref: "mailto:scott@cardinalelement.com",
    media: { image: genS40Council, speed: -0.18 },
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
    links: [
      { label: "scott@cardinalelement.com", href: "mailto:scott@cardinalelement.com" },
      { label: "linkedin.com/in/scottewalt", href: "https://www.linkedin.com/in/scottewalt" },
    ],
    footnote: "Take the kit: /kit",
    footnoteHref: "/kit",
    media: { image: genS37OneObject, speed: -0.12 },
  },
];
