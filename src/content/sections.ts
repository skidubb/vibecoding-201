import type { StaticImageData } from "next/image";
import type { BrandKey } from "@/components/layouts/Logo";

import opsRoomA from "@/assets/ops-room-a.webp";
import opsRoomB from "@/assets/ops-room-b.webp";
import recordRefreshB from "@/assets/record-refresh-b.webp";
import failureB from "@/assets/failure-b.webp";

/**
 * Backdrops.
 *
 * These filenames are numbered for the earlier forty-slide cut, so they no longer
 * match slide positions and are chosen by subject instead. `s12-timer` goes on
 * whichever slide has a clock.
 */
import genS01Doorway from "@/assets/generated/s01-doorway.webp";
import genS02TwoLaptops from "@/assets/generated/s02-two-laptops.webp";
import genS04Monday from "@/assets/generated/s04-monday.webp";
import genS10PagePassed from "@/assets/generated/s10-page-passed.webp";
import genS11TwoSheets from "@/assets/generated/s11-two-sheets.webp";
import genS12Timer from "@/assets/generated/s12-timer.webp";
import genS14TheQuestion from "@/assets/generated/s14-the-question.webp";
import genS17OverShoulder from "@/assets/generated/s17-over-shoulder.webp";
import genS18SixBinders from "@/assets/generated/s18-six-binders.webp";
import genS19HandsUp from "@/assets/generated/s19-hands-up.webp";
import genS21WrongSide from "@/assets/generated/s21-wrong-side.webp";
import genS22SealedEnvelope from "@/assets/generated/s22-sealed-envelope.webp";
import genS23FiveEntrances from "@/assets/generated/s23-five-entrances.webp";
import genS25TwoParcels from "@/assets/generated/s25-two-parcels.webp";
import genS26LedgerAndNote from "@/assets/generated/s26-ledger-and-note.webp";
import genS27HandsUp2 from "@/assets/generated/s27-hands-up-2.webp";
import genS28GreenLights from "@/assets/generated/s28-green-lights.webp";
import genS36ThreeLines from "@/assets/generated/s36-three-lines.webp";
import genS38AboutToSend from "@/assets/generated/s38-about-to-send.webp";
import genS39NineItems from "@/assets/generated/s39-nine-items.webp";
import genS40Council from "@/assets/generated/s40-council.webp";
import genS20bOneKey from "@/assets/generated/s20b-one-key.webp";
import genS13HoveringPen from "@/assets/generated/s13-hovering-pen.webp";
import genS32ManyPhones from "@/assets/generated/s32-many-phones.webp";
import genS30Unplugging from "@/assets/generated/s30-unplugging.webp";
import genS09Ring from "@/assets/generated/s09-ring.webp";

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
  | "pipeline"
  | "matrix"
  | "surfaced";

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
   * Used only by the pipeline layout. The stack slide recommends six tools, and
   * the receipt under each one records what this site actually did at that step,
   * including the step it skipped.
   */
  receipt?: string;
};

export type TimelineStop = {
  day: string;
  title: string;
  body?: string;
  image?: StaticImageData;
  tone?: "neutral" | "bad";
  /**
   * The point in the hour where this day's failure is addressed.
   *
   * The week and the agenda used to be two slides. Putting the timestamp on the
   * day removes the second slide and keeps the two from drifting apart.
   */
  repaired?: string;
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
export type Exercise =
  | { id: string; seconds: number; mode?: "write"; placeholder: string }
  /**
   * A clock with nothing to submit, for the two self-scoring exercises.
   *
   * The room scores work it already has against a list on the slide, so this mode
   * opens no database connection. A union rather than a `submit: false` flag so a
   * timer cannot carry a placeholder and a writing box cannot omit one, which
   * makes `npm run build` catch the mistake.
   */
  | { id: string; seconds: number; mode: "timer"; placeholder?: never };

/**
 * A comparison table.
 *
 * Column 0 holds the row label and renders as a `<th scope="row">`, so it reads
 * bold for a structural reason rather than a styling one. There is no per-row bold
 * flag: formatting belongs in the component, not in this file.
 *
 * `head` may start with an empty string. Several of these tables leave the label
 * column unnamed, and omitting the entry misaligns the header against the rows.
 */
export type Matrix = {
  head?: string[];
  rows: string[][];
  /** Per column, defaulting to left. Only the slide with a time column sets it. */
  align?: ("left" | "right")[];
};

/**
 * The slide's position in Spec → Plan → Build → Test → Ship → Run.
 *
 * `all` lists all six steps every time, so the strip always shows the whole
 * sequence. `current` matches by value rather than index, which keeps the entry
 * readable and allows two highlighted steps that are not adjacent.
 */
export type Steps = { all: string[]; current: string[] };

/**
 * A read-only view of the submissions the presenter has put on screen.
 *
 * Not an `Exercise` with the same id: that would render a second writing box and a
 * second Share button, letting an attendee edit their spec while it is being read
 * aloud. This section has no clock and no control that writes. Surfacing happens
 * in the presenter bar, which is what keeps `authors_cannot_surface` enforced in
 * the database rather than in the interface.
 */
export type Surfaced = {
  exerciseId: string;
  /** What the slide says before anything has been put up. */
  empty?: string;
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

/** One outbound reference on a GO DEEPER strip. */
export type DeeperLink = { label: string; href: string };

/**
 * The small strip at the bottom of a slide: one claim, and where to read more.
 *
 * For people who already know the material. It is never read aloud, so it has to
 * work on the recording and for anyone scrolling the site later.
 *
 * Not a `LinkRef[]`: `LinkRef` carries `note` and `install`, which this strip does
 * not render, and a field a component ignores is the defect
 * `tests/registry-integrity.spec.ts` exists to catch. The type lists only what is
 * drawn.
 *
 * Fourteen sections have one and twelve do not. The twelve are the polls, the
 * timers and the demo, where the room is talking rather than reading.
 */
export type Deeper = {
  /** Defaults to "Go deeper". */
  label?: string;
  /** The one sentence the strip makes. */
  claim: string;
  /** A trailing qualifier: a caveat or a note on scope. */
  note?: string;
  /** One or two. More does not fit on one line. */
  links: DeeperLink[];
};

export type Section = {
  id: string;
  theme: "dark" | "light";
  layout: LayoutKind;
  eyebrow?: string;
  /** The progress strip through the 201 Loop. Renders under the eyebrow. */
  steps?: Steps;
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
  /** Renders below the footnote, faint, at the very bottom of the slide. */
  deeper?: Deeper;
  media?: Media;
  cards?: Card[];
  timeline?: TimelineStop[];
  chart?: "ladder" | "scurve" | "gap";
  matrix?: Matrix;
  split?: { label: string; title: string; body: string; image: StaticImageData }[];
  loopSteps?: string[];
  prompts?: Prompt[];
  links?: LinkRef[];
  poll?: Poll;
  exercise?: Exercise;
  surfaced?: Surfaced;
};

/**
 * The deck, in order.
 *
 * Twenty-six sections, quoted from `deck-content-v7.md`. Three rules from that
 * file apply to every entry:
 *
 *   1. Anything said out loud is not printed. The spoken lines stay in the deck's
 *      speaker notes, so this file reads sparser than the talk.
 *   2. No sentence restates the one before it.
 *   3. Every headline has to make sense with the rest of the slide covered.
 *
 * A fourth rule overrides those three wherever they conflict: no metaphors, and no
 * line that refers to something not on the slide. Several phrases quoted faithfully
 * from the outline broke both and were rewritten. See CLAUDE.md.
 */
export const sections: Section[] = [
  {
    id: "title",
    theme: "dark",
    layout: "hero",
    eyebrow: "Vibecoding 201",
    title: "Building Production GTM Tools",
    accent: "Production",
    lede: "One GTM prototype, from a chat window to a tool your team depends on.",
    kicker: "Scott Ewalt · Founder, Cardinal Element",
    footnote: "Pavilion AI in GTM School",
    deeper: {
      claim: "This deck's own source code.",
      note: "Every claim in the next hour is checkable against it.",
      links: [
        {
          label: "github.com/skidubb/vibecoding-201",
          href: "https://github.com/skidubb/vibecoding-201",
        },
      ],
    },
    media: { image: genS01Doorway, speed: -0.12 },
  },

  {
    id: "what-changed",
    theme: "dark",
    layout: "claim",
    eyebrow: "101 · May 20",
    title: "You built prototypes. Today you build something people depend on.",
    accent: "depend on.",
    railLabel: "What changed since 101",
    kicker:
      "Everything you can see is cheap to build now. Everything underneath is where tools die.",
    deeper: {
      claim:
        "Google's New SDLC whitepaper draws the same line between vibe coding and agentic engineering.",
      links: [
        {
          label: "The New SDLC With Vibe Coding",
          href: "https://www.kaggle.com/whitepaper-the-new-SDLC-with-vibe-coding",
        },
      ],
    },
    // Two office floors separated by an open stairwell void, the near one small
    // and finished, the far one larger and busier. The slide makes the same point
    // about the distance between a prototype and a system people depend on.
    media: {
      video: "/media/gap-platforms.mp4",
      poster: "/media/gap-platforms-poster.jpg",
      speed: -0.15,
    },
  },

  {
    // `cold-open`, not `two-screens`: the id is the poll slug's twin and the
    // anchor two specs locate this section by. The slide's name changed; what
    // the section *is* did not.
    id: "cold-open",
    theme: "dark",
    layout: "poll",
    eyebrow: "Two screens",
    railLabel: "Two screens",
    title: "Which one runs Monday's retention meeting?",
    accent: "Monday's retention meeting?",
    lede: "Vote in the chat.",
    poll: {
      slug: "cold-open",
      variant: "two-up",
      options: [
        {
          id: "cold-open:a",
          label: "A",
          name: "Screen A",
          body: "Built in twelve minutes. Sample data. Open link.",
        },
        {
          id: "cold-open:b",
          label: "B",
          name: "Screen B",
          body: "Stores real records, controls access, refreshes itself, logs failures.",
        },
      ],
    },
    media: { image: genS02TwoLaptops, speed: -0.12 },
  },

  {
    id: "jordan",
    theme: "light",
    layout: "timeline",
    eyebrow: "Running case · Jordan, VP RevOps",
    title: "The week the prototype died",
    accent: "died",
    railLabel: "Jordan's week",
    timeline: [
      {
        day: "Sunday",
        title: "Builds a churn-risk dashboard in Lovable",
        image: opsRoomA,
      },
      {
        day: "Monday",
        title: "Leadership loves it, asks the team to use it every Monday",
        image: opsRoomB,
      },
      {
        day: "Tuesday",
        title:
          "A partner changes one number in the URL and sees another team's accounts",
        tone: "bad",
        repaired: "by rules enforced in the database",
        image: genS20bOneKey,
      },
      {
        day: "Wednesday",
        title:
          "The screen looks healthy while the sync has been dead for nine days",
        tone: "bad",
        repaired: "by logs and alerts a named human reads",
        image: recordRefreshB,
      },
      {
        day: "Thursday",
        title: "Nobody can explain the risk score",
        tone: "bad",
        repaired: "when code calculates and the model explains",
        image: genS13HoveringPen,
      },
      {
        day: "Friday",
        title: "The spreadsheet returns",
        tone: "bad",
        repaired: "by a named owner",
        image: failureB,
      },
    ],
    media: { image: genS04Monday, speed: -0.12 },
  },

  {
    id: "three-kinds",
    theme: "dark",
    layout: "matrix",
    eyebrow: "Before you commit",
    title: "Is it a prototype, a tool, or a system?",
    accent: "prototype, a tool, or a system?",
    matrix: {
      head: ["", "Test you can observe", "What it changes"],
      rows: [
        [
          "System",
          "Runs across teams, data sources, permissions, time, and failure",
          "The business",
        ],
        [
          "Tool",
          "A defined group reliably completes a real workflow",
          "The work",
        ],
        [
          "Prototype",
          "Demonstrates the idea with sample or temporary inputs",
          "Belief",
        ],
      ],
    },
    strip: {
      label: "Ask before you build",
      items: [
        "Is the workflow frequent or consequential enough to matter?",
        "Is the process stable enough to encode?",
        "Is there a named user, outcome, and owner?",
        "What new risk appears when others depend on it?",
      ],
    },
    // A lateral drift past one person alone, then a pair, then a full room in
    // session. That is this table's three rows in order, despite the filename:
    // the clip is about who depends on the thing, not about deploy environments.
    media: {
      video: "/media/three-environments.mp4",
      poster: "/media/three-environments-poster.jpg",
      speed: -0.12,
    },
  },

  {
    id: "place-yours",
    theme: "light",
    layout: "exercise",
    eyebrow: "Hands on · 90 seconds",
    title: "Pick something you have built. Prototype, tool, or system?",
    accent: "Prototype, tool, or system?",
    exercise: { id: "place-yours", seconds: 90, mode: "timer" },
    // The four questions are repeated from the previous slide. This slide
    // previously read "Then the four questions. Yes or no." while showing none of
    // them, so the instruction referred to content the room could not see.
    //
    // Cards rather than a `strip`: `Strip` joins its items with a dot separator,
    // which turned four full questions into one unreadable run of text.
    cards: [
      { title: "Is the workflow frequent or consequential enough to matter?" },
      { title: "Is the process stable enough to encode?" },
      { title: "Is there a named user, outcome, and owner?" },
      { title: "What new risk appears when others depend on it?" },
    ],
    kicker: "Answer each one yes or no.",
    media: { image: genS14TheQuestion, speed: -0.12 },
  },

  {
    // Added in v9: four step slides referenced a six-step loop the deck never
    // introduced. This slide introduces it by name before the Spec step.
    id: "loop-overview",
    theme: "dark",
    layout: "pipeline",
    eyebrow: "How the next forty minutes are organized",
    title:
      "How a prototype becomes production: Spec, Plan, Build, Test, Ship, Run",
    accent: "Spec, Plan, Build, Test, Ship, Run",
    railLabel: "The development process",
    cards: [
      {
        title: "Spec",
        body: "Write the job, the user, and how you will check it.",
      },
      {
        title: "Plan",
        body: "The agent proposes; you approve before anything changes.",
      },
      {
        title: "Build",
        body: "The agent writes the code inside the rules you set.",
      },
      {
        title: "Test",
        body: "The agent proves the workflow behaves; you watch it work.",
      },
      {
        title: "Ship",
        body: "A person promotes it to where people depend on it.",
      },
      { title: "Run", body: "Watch it, log it, and name who fixes it." },
    ],
    media: { image: genS09Ring, speed: -0.12 },
  },

  {
    id: "spec",
    theme: "dark",
    layout: "matrix",
    eyebrow: "Step 1 · Spec",
    steps: {
      all: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
      current: ["Spec"],
    },
    title: "Write down the job, the user, and how you will check it",
    accent: "how you will check it",
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
    matrix: {
      head: ["Vague", "Testable"],
      rows: [
        [
          "Preserves updates",
          "Change an account's next action, refresh, confirm it persists.",
        ],
      ],
    },
    strip: {
      label: "Also specify",
      items: ["source data", "access rules", "failure behavior", "non-goals"],
    },
    kicker:
      "If you cannot write the steps, you do not yet know what you are asking for.",
    deeper: {
      claim: "GitHub Spec Kit.",
      note: "Spec-driven development as a full toolchain: each phase produces an artifact the next phase reads.",
      links: [
        { label: "github/spec-kit", href: "https://github.com/github/spec-kit" },
        { label: "docs", href: "https://github.github.com/spec-kit" },
      ],
    },
    media: { image: genS11TwoSheets, speed: -0.12 },
  },

  {
    // `director-mode`, not `plan`: tests/helpers.ts locates the plan prompt by
    // this anchor, and the prompt is the same object the deck has always called
    // Director mode.
    id: "director-mode",
    theme: "light",
    layout: "prompt",
    eyebrow: "Step 2 · Plan",
    steps: {
      all: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
      current: ["Plan"],
    },
    title: "Approve a plan before anything changes",
    accent: "before anything changes",
    railLabel: "Plan",
    prompts: [
      {
        id: "plan-approval",
        label: "The plan prompt",
        text: "Inspect the current project. Propose the smallest coherent implementation for this specification. Identify the data model, permissions, environment variables, failure states, tests, and files involved. Do not change anything until I approve the plan.",
        caption:
          "The last sentence is why the whole prompt works: it makes the plan the thing you review, and a plan is cheap to change.",
      },
    ],
    strip: {
      label: "Questions to ask of any plan",
      items: [
        "Does it solve the stated job?",
        "What assumptions did it invent?",
        "What data and permissions does it require?",
        "How will the core workflow be tested?",
        "What is deliberately excluded?",
      ],
    },
    deeper: {
      claim: "Claude Code best practices.",
      note: "Plan mode, context handling, and how to structure work an agent will pick up cold.",
      links: [
        {
          label: "code.claude.com/docs",
          href: "https://code.claude.com/docs/en/best-practices",
        },
      ],
    },
    media: { image: genS10PagePassed, speed: -0.15 },
  },

  {
    id: "harness",
    theme: "dark",
    layout: "matrix",
    eyebrow: "Step 3 · Build",
    steps: {
      all: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
      current: ["Build"],
    },
    title: "Files to add to your folder / repo",
    accent: "your folder / repo",
    matrix: {
      rows: [
        [
          "PRODUCT.md",
          "What this is, who it serves, what it deliberately does not do",
        ],
        [
          "ARCHITECTURE.md",
          "The decisions and why, so the next change does not quietly undo one",
        ],
        ["DATA_MODEL.md", "What is stored, and what each rule protects"],
        ["SECURITY.md", "Who may read and change what, and how that is enforced"],
        ["CLAUDE.md / AGENTS.md", "How your agent should work in this repository"],
        [".env.example", "The names of every credential. Never the values"],
      ],
    },
    kicker:
      "The assistant you rent is the same one your competitors rent. The edge is what yours is grounded in.",
    deeper: {
      claim: "AGENTS.md is the open format for this file,",
      note: "readable by most coding agents rather than one vendor's.",
      links: [{ label: "agents.md", href: "https://agents.md" }],
    },
    media: { image: genS18SixBinders, speed: -0.12 },
  },

  {
    id: "assignment",
    theme: "light",
    layout: "exercise",
    eyebrow: "Hands on · 15 minutes",
    title: "Build your spec, get a plan, review it",
    accent: "review it",
    railLabel: "The assignment",
    cards: [
      {
        title: "Write your three-line spec: Job, User, Done",
        body: "Submit it. Share it if you want it in the mix.",
      },
      {
        title: "Paste the plan prompt above your spec and fire it",
        body: "Use your 101 Claude Project.",
      },
      {
        title: "Count the assumptions the plan invented",
        body: "A source system you never named. A field you never described. A permission rule you never gave it. Keep the number.",
      },
      {
        title: "If you get there: ask it to write PRODUCT.md and SECURITY.md",
        body: "Generated from your spec and plan.",
      },
    ],
    exercise: {
      id: "spec",
      seconds: 900,
      placeholder:
        "Job.\nUser.\nDone, written as steps someone else could follow to check it.",
    },
    footnote: "No plan came back? Take the pre-generated one from the kit",
    footnoteHref: "/kit",
    media: { image: genS12Timer, speed: -0.12 },
  },

  {
    id: "room-specs",
    theme: "dark",
    layout: "surfaced",
    eyebrow: "What you wrote",
    title: "Specs you just wrote, rewritten live on this screen",
    accent: "rewritten live",
    lede: "Submissions appear here as their authors share them.",
    surfaced: {
      exerciseId: "spec",
      empty:
        "Nothing on screen yet. Shared specs appear here when Scott puts one up.",
    },
    media: { image: genS36ThreeLines, speed: -0.15 },
  },

  {
    id: "demo",
    theme: "light",
    layout: "cards",
    eyebrow: "Demonstration",
    title: "Watch the agent plan a change before it makes it",
    accent: "before it makes it",
    railLabel: "Live demo",
    cards: [
      { title: "The project is already in GitHub" },
      { title: "The agent reads the project before acting" },
      { title: "It proposes a plan. I approve it before any file changes" },
      {
        title:
          "It makes one change that survives a refresh, written to the database",
      },
    ],
    kicker: "Your job: chat the assumptions it invented.",
    media: { image: genS17OverShoulder, speed: -0.12 },
  },

  {
    id: "poll-debugging",
    theme: "dark",
    layout: "poll",
    eyebrow: "Poll 1 · single choice",
    title: "What do you do when one error keeps coming back?",
    accent: "one error keeps coming back?",
    lede: "The build works except for one error that keeps happening.",
    poll: {
      slug: "debugging",
      options: [
        { id: "debugging:a", label: "A", body: "Rewrite the original prompt" },
        {
          id: "debugging:b",
          label: "B",
          body: "Regenerate it in another platform",
        },
        {
          id: "debugging:c",
          label: "C",
          body: "Provide the error, reproduction steps, and expected behavior, then ask the agent to diagnose and test a fix",
        },
        { id: "debugging:d", label: "D", body: "Read every line of code" },
      ],
    },
    media: { image: genS19HandsUp, speed: -0.12 },
  },

  {
    id: "breach-test",
    theme: "dark",
    layout: "claim",
    eyebrow: "Hands on · 2 minutes",
    title: "Ask my database for a record you have no right to",
    accent: "no right to",
    railLabel: "Run the security test",
    strip: {
      items: [
        "Open the link. Sign in as a guest.",
        "Button 1. Request a record from your organization.",
        "Button 2. Request a record from Organization B.",
      ],
    },
    footnote: "Live database. The policy is in the public repo",
    footnoteHref:
      "https://github.com/skidubb/vibecoding-201/blob/main/supabase/migrations/20260727000000_init.sql",
    deeper: {
      claim: "The fifteen policies you just hit,",
      note: "and the breach class they prevent: 170+ apps on the platform Jordan used shipped without them.",
      links: [
        {
          label: "authorization.sql",
          href: "https://github.com/skidubb/vibecoding-201/blob/main/supabase/tests/authorization.sql",
        },
        {
          label: "CVE-2025-48757",
          href: "https://mattpalmer.io/posts/2025/05/CVE-2025-48757",
        },
      ],
    },
    media: { image: genS21WrongSide, speed: -0.15 },
  },

  // v9 removed the "Signing in and being allowed" section per Scott's comment
  // ("too in the weeds"); its lesson is one spoken line in the security-test
  // notes now.
  {
    id: "secrets",
    theme: "light",
    layout: "matrix",
    eyebrow: "Build · credentials",
    title: "Keep your credentials out of your code",
    accent: "out of your code",
    matrix: {
      rows: [
        [".env.local", "The real values. Never leaves your machine."],
        [".env.example", "The names only. Safe to commit."],
        [".gitignore", "Keeps the first one out of GitHub."],
      ],
    },
    strip: {
      items: [
        "Secrets never go in GitHub or in browser code.",
        "An exposed secret gets revoked and rotated, never hidden.",
      ],
    },
    deeper: {
      claim: "OWASP secrets management cheat sheet.",
      note: "Rotation, vaulting, and what to do the morning after a leak.",
      links: [
        {
          label: "cheatsheetseries.owasp.org",
          href: "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html",
        },
      ],
    },
    media: { image: genS22SealedEnvelope, speed: -0.15 },
  },

  {
    id: "data-doors",
    theme: "dark",
    layout: "matrix",
    eyebrow: "Build · connections",
    title: "Choose how your tool connects to its data",
    accent: "connects to its data",
    matrix: {
      head: ["", "Use when", "Costs you"],
      rows: [
        [
          "Manual",
          "Rare, ambiguous, or judgment-heavy work",
          "Stale data and human effort",
        ],
        [
          "Computer use",
          "Stable interface, no usable integration",
          "Fragility and terms-of-service limits",
        ],
        [
          "API",
          "App-to-app work at runtime",
          "Auth, rate limits, engineering overhead",
        ],
        [
          "MCP",
          "Governed agent access to tools and context",
          "Connector quality and permissions",
        ],
        [
          "CLI",
          "The agent driving GitHub, Vercel, Supabase, tests, logs",
          "Powerful access needs guardrails",
        ],
      ],
    },
    strip: {
      label: "Choose on",
      items: [
        "frequency",
        "consequence",
        "volume",
        "expected lifetime",
        "stability",
        "retry safety",
      ],
    },
    deeper: {
      claim: "The MCP specification itself.",
      note: "Worth reading if you are deciding what your company exposes to agents.",
      links: [
        {
          label: "modelcontextprotocol.io",
          href: "https://modelcontextprotocol.io/specification",
        },
      ],
    },
    media: { image: genS23FiveEntrances, speed: -0.12 },
  },

  {
    id: "idempotency",
    theme: "dark",
    layout: "claim",
    eyebrow: "Build · idempotency",
    title: "What happens if this runs twice?",
    accent: "runs twice?",
    lede: "Imports, webhooks, CRM writes, and scheduled jobs all repeat, and the duplicate they create stays invisible until a customer finds it.",
    strip: {
      items: [
        "The safe answer is an update to the existing record, never a second copy.",
      ],
    },
    deeper: {
      claim: "Stripe's idempotency key design",
      note: "is the reference implementation, and the reason your card never gets charged twice.",
      links: [
        {
          label: "docs.stripe.com",
          href: "https://docs.stripe.com/api/idempotent_requests",
        },
      ],
    },
    media: { image: genS25TwoParcels, speed: -0.15 },
  },

  {
    id: "poll-door",
    theme: "dark",
    layout: "poll",
    eyebrow: "Poll 2 · single choice",
    title:
      "A competitor publishes pricing with no API. Jordan needs a reviewed snapshot every Monday.",
    accent: "every Monday.",
    lede: "Most proportionate start?",
    poll: {
      slug: "proportionate-door",
      options: [
        {
          id: "proportionate-door:a",
          label: "A",
          body: "Hire someone to copy it every week",
        },
        {
          id: "proportionate-door:b",
          label: "B",
          body: "Browser automation with validation and an exception path",
        },
        { id: "proportionate-door:c", label: "C", body: "Build a custom API" },
        {
          id: "proportionate-door:d",
          label: "D",
          body: "Assume an MCP connector exists",
        },
      ],
    },
    media: { image: genS27HandsUp2, speed: -0.12 },
  },

  {
    id: "insight-rule",
    theme: "light",
    layout: "matrix",
    eyebrow: "Build · Jordan's churn-risk dashboard",
    title: "Code calculates, the model explains",
    accent: "the model explains",
    matrix: {
      head: ["What the code does", "What the model does"],
      rows: [
        [
          "Calculates the churn score, the thresholds, and the ranking",
          "Explains why an account was flagged and recommends the next action",
        ],
        [
          "The same inputs produce the same number every run",
          "Grounded in numbers the code already produced, never inventing them",
        ],
        [
          "Can be audited and tested",
          "Turns the numbers into language an account owner can act on",
        ],
      ],
    },
    lede: "The model does not invent the churn score from raw CRM data.",
    kicker: "A risk score the model invented has nothing behind it to audit.",
    media: { image: genS26LedgerAndNote, speed: -0.15 },
  },

  // v9 removed the "Show people when the data is stale" section per Scott's
  // comment; the Run section carries the observability lesson, and Jordan's
  // Wednesday repair points there.
  {
    id: "test-and-ship",
    theme: "light",
    layout: "matrix",
    eyebrow: "Steps 4 and 5 · Test and ship",
    steps: {
      all: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
      current: ["Test", "Ship"],
    },
    title: "The agent writes the tests. You decide when it ships.",
    accent: "You decide when it ships.",
    matrix: {
      rows: [
        ["You", "Define the behavior, then verify the finished work as a user"],
        [
          "The agent",
          "Writes the test, watches it fail, implements, and runs it until green",
        ],
      ],
    },
    lede:
      "Break things in a local copy and prove the fix on a preview link. Production is the version other people depend on.",
    strip: {
      label: "Tests to pass before anyone depends on it",
      items: [
        "the workflow completes",
        "a user without permission is refused",
        "malformed input is rejected",
        "a double submission stays one record",
        "a dead data source is handled",
        "a saved change survives a refresh",
      ],
    },
    kicker:
      "Promotion is a decision someone makes, never a side effect of saving a file.",
    deeper: {
      claim: "Agents now run these tests themselves:",
      note: "promoting a preview as an explicit step, and an agent that tests apps in a real browser.",
      links: [
        {
          label: "vercel.com/docs",
          href: "https://vercel.com/docs/deployments/promote-preview-to-production",
        },
        {
          label: "replit.com/blog",
          href: "https://replit.com/blog/introducing-agent-3-our-most-autonomous-agent-yet",
        },
      ],
    },
    media: { image: genS28GreenLights, speed: -0.15 },
  },

  {
    // Keep this id. `CardsLayout` renders this site's own live event feed on it —
    // the slide argues for logging and then shows its own log, which is the
    // difference between teaching analytics and having them.
    id: "run",
    theme: "light",
    layout: "cards",
    eyebrow: "Step 6 · Run",
    steps: {
      all: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
      current: ["Run"],
    },
    title: "Watch it, log it, and name who fixes it",
    accent: "name who fixes it",
    cards: [
      { title: "Analytics", body: "Is it being used, and is it creating value?" },
      {
        title: "Logs",
        body: "A record of what happened on every run, for the day something looks wrong.",
      },
      {
        title: "Alerts",
        body: "When it fails, a named human finds out. A log entry nobody reads is not an alert.",
      },
    ],
    strip: {
      label: "Ownership, written down",
      items: [
        "a named owner and a backup",
        "a way to roll back a bad change",
        "known limitations",
        "a review date",
        "a way to shut it down on purpose",
      ],
    },
    kicker:
      "Planning how a tool ends costs an afternoon. Skipping it is how a working tool becomes somebody's unpaid second job.",
    footnote:
      "A tool nobody owns dies the first time it breaks, and the old spreadsheet comes back.",
    deeper: {
      claim: "This project's OWNERSHIP.md,",
      note: "including the two items still marked undecided.",
      links: [
        {
          label: "OWNERSHIP.md",
          href: "https://github.com/skidubb/vibecoding-201/blob/main/OWNERSHIP.md",
        },
      ],
    },
    // A slow orbit of six working stations that returns to where it started. Run
    // is the sixth step and the one that feeds the next spec, so the closed
    // circuit belongs here rather than on any single earlier step.
    media: {
      video: "/media/workflow-loop.mp4",
      poster: "/media/workflow-loop-poster.jpg",
      speed: -0.12,
    },
  },

  {
    id: "the-bar",
    theme: "dark",
    layout: "exercise",
    eyebrow: "Hands on · 90 seconds",
    title: "What a tool must have before people depend on it",
    accent: "before people depend on it",
    railLabel: "The production standard",
    cards: [
      {
        title: "Persistent data",
        body: "Records survive a refresh because they live in a real database.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/supabase/migrations/20260727000000_init.sql",
      },
      {
        title: "Sign-in",
        body: "The tool knows who each user is. Here: anonymous and Google.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/src/app/signin/page.tsx",
      },
      {
        title: "Enforced authorization",
        body: "The database decides what each user may see. Hiding records in the interface is not security.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/supabase/tests/authorization.sql",
      },
      {
        title: "Server-side secrets",
        body: "Credentials never appear in code. The repository holds references to a vault, never values.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/.env.op",
      },
      {
        title: "A tested critical workflow",
        body: "The main workflow runs under an automated test on every change.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/.github/workflows/ci.yml",
      },
      {
        title: "Visible error states",
        body: "Every failure says what happened in words.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/tests/upstream-failure.spec.ts",
      },
      {
        title: "Logs and analytics",
        body: "Every run leaves a record someone can read back.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/src/lib/events.ts",
      },
      {
        title: "Preview before production",
        body: "A person promotes each change. Saving a file is not shipping.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/ARCHITECTURE.md",
      },
      {
        title: "A named owner",
        body: "Someone answers when it breaks, and can roll it back. The backup owner and shutdown path here still say undecided, in public, because writing undecided beats leaving it blank.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/OWNERSHIP.md",
        met: false,
      },
    ],
    exercise: { id: "score", seconds: 90, mode: "timer" },
    kicker:
      "Score a tool you have built. Check what it passes, leave the rest blank. The blanks are your homework.",
    deeper: {
      claim: "This site scored against all nine,",
      note: "with every link going to the thing itself, including the one it fails.",
      links: [
        {
          label: "github.com/skidubb/vibecoding-201",
          href: "https://github.com/skidubb/vibecoding-201",
        },
      ],
    },
    media: { image: genS39NineItems, speed: -0.15 },
  },

  {
    // Added in v9: the class demonstrates one route to production; this slide
    // says the route is interchangeable and names the other three.
    id: "routes",
    theme: "dark",
    layout: "matrix",
    eyebrow: "The wider map · new for August 2026",
    title: "This class taught one of four routes to production",
    accent: "four routes",
    railLabel: "Four routes",
    matrix: {
      head: ["", "Solves", "Still yours"],
      rows: [
        [
          "Stay in the platform you prototyped in: Replit or Lovable",
          "The assembly problem: hosting, sign-in, a database, and scanning come built in",
          "The authorization rules, the final verification, the owner",
        ],
        [
          "Assemble the stack, as this class did: agent, GitHub, Vercel, Supabase",
          "The control problem: every layer visible, testable, swappable",
          "The assembly itself, and every check until you delegate it",
        ],
        [
          "Build on the platform your company already runs: Microsoft, Google, or AWS",
          "The governance problem: identity, permissions, and compliance already exist",
          "Patience, and an engineering partner",
        ],
        [
          "Buy it",
          "The ownership problem: uptime and maintenance are the vendor's payroll",
          "The acceptance test, and an owner for the contract",
        ],
      ],
    },
    kicker:
      "On every route, the authorization rules, the final verification, and the named owner stay with the builder.",
    deeper: {
      claim: "The full route map:",
      note: "the nine checks covered per route, and five questions that pick one. Verified August 2026.",
      links: [{ label: "/kit", href: "/kit" }],
    },
    media: { image: genS32ManyPhones, speed: -0.12 },
  },

  {
    // Added in v9: the durable claim behind the hour. Input written for a model
    // depreciates on a release schedule; checks on its output appreciate.
    id: "evolution",
    theme: "light",
    layout: "matrix",
    eyebrow: "The evolution",
    title:
      "What you write for the model depreciates. What checks its output appreciates.",
    accent: "What checks its output appreciates.",
    railLabel: "The evolution",
    lede: "The people who build the coding agents keep deleting what goes into the model and keep adding what checks what comes out.",
    matrix: {
      rows: [
        [
          "Last year's models",
          "You wrote the plan, reviewed it before code, and reviewed every line that came out",
        ],
        [
          "Today's models",
          "You keep the checkable Done; the model drafts its own plan and catches its own errors",
        ],
        [
          "Frontier agents",
          "You design the run: the goal, the guardrails, and a verifier the agent executes without you",
        ],
      ],
    },
    kicker:
      "An unverified multi-day agent run is the most expensive way to be wrong that exists today.",
    deeper: {
      claim: "Boris Cherny, who built Claude Code, never walked back verification",
      note: "while deleting instructions, plan mode, and prompts release by release.",
      links: [
        {
          label: "ycrootaccess.com",
          href: "https://www.ycrootaccess.com/p/boris-cherny-building-claude-code",
        },
        {
          label: "claude.com/blog",
          href: "https://claude.com/blog/running-an-ai-native-engineering-org",
        },
      ],
    },
    media: { image: genS30Unplugging, speed: -0.15 },
  },

  {
    id: "homework",
    theme: "dark",
    layout: "cards",
    eyebrow: "Before the next session",
    title: "Ship one narrow internal tool",
    accent: "one narrow internal tool",
    cards: [
      {
        title: "Your three-line spec",
        body: "Job, User, and a Done someone else could check.",
      },
      {
        title: "The live link",
        body: "Or a recorded walkthrough of the workflow.",
      },
      {
        title: "One known limitation",
        body: "The item that proves you verified it.",
      },
    ],
    lede:
      "The skill is knowing which work you are not doing, and directing it instead.",
    kicker: "Ship something small. Make sure it gets used.",
    footnote: "The kit is at /kit. No email required",
    footnoteHref: "/kit",
    deeper: {
      claim:
        "Checklist, prompt pack, agent instructions, ownership card, CLI reference, route map.",
      note: "All six, no email.",
      links: [{ label: "/kit", href: "/kit" }],
    },
    media: { image: genS38AboutToSend, speed: -0.12 },
  },

  {
    id: "qa",
    theme: "dark",
    layout: "poll",
    eyebrow: "30 minutes",
    title: "Questions",
    railLabel: "Q&A",
    footnote:
      "Priya, Head of Partnerships, built a partner deal-registration app in Lovable on Sunday. Sample data, no sign-in, looks great. She wants to send the link to 40 partners on Monday. What is the right call?",
    poll: {
      slug: "priya",
      options: [
        {
          id: "priya:a",
          label: "A",
          body: "Ship it, it is only 40 partners",
        },
        { id: "priya:b", label: "B", body: "Polish the interface first" },
        {
          id: "priya:c",
          label: "C",
          body: "Hold. It needs real storage, controlled access, and a review before anything external-facing ships",
        },
        {
          id: "priya:d",
          label: "D",
          body: "Rebuild it from scratch in the terminal",
        },
      ],
    },
    strip: {
      label: "Four buckets",
      items: [
        "Should you build it? Prototype or tool, frequency, consequence, owner",
        "How do I specify it? Job, user, checkable Done, non-goals",
        "How should it connect? The proportionate door",
        "How is it verified? Workflow run, failure states, review gate",
      ],
    },
    // No GO DEEPER here, deliberately. The deck's own tally leaves the Q&A blank
    // along with the polls, the timers and the demo — a pointer on a slide the
    // room is talking through is filler, and filler in that slot trains people to
    // stop reading it. The contact line is a link, not a citation.
    links: [
      {
        label: "Scott Ewalt · Cardinal Element",
        href: "mailto:scott@cardinalelement.com",
        note: "Anything unanswered goes to #ai-gtm in writing within 48 hours.",
      },
    ],
    media: { image: genS40Council, speed: -0.15 },
  },
];
