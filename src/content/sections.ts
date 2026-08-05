import type { StaticImageData } from "next/image";
import type { BrandKey } from "@/components/layouts/Logo";

/**
 * Backdrops.
 *
 * These filenames are numbered for the earlier forty-slide cut, so they no longer
 * match slide positions and are chosen by subject instead. `s12-timer` goes on
 * whichever slide has a clock.
 */
import genS01Doorway from "@/assets/generated/s01-doorway.webp";
import genS02TwoLaptops from "@/assets/generated/s02-two-laptops.webp";
import genS10PagePassed from "@/assets/generated/s10-page-passed.webp";
import genS11TwoSheets from "@/assets/generated/s11-two-sheets.webp";
import genS12Timer from "@/assets/generated/s12-timer.webp";
import genS17OverShoulder from "@/assets/generated/s17-over-shoulder.webp";
import genS18SixBinders from "@/assets/generated/s18-six-binders.webp";
import genS19HandsUp from "@/assets/generated/s19-hands-up.webp";
import genS22SealedEnvelope from "@/assets/generated/s22-sealed-envelope.webp";
import genS23FiveEntrances from "@/assets/generated/s23-five-entrances.webp";
import genS25TwoParcels from "@/assets/generated/s25-two-parcels.webp";
import genS26LedgerAndNote from "@/assets/generated/s26-ledger-and-note.webp";
import genS27HandsUp2 from "@/assets/generated/s27-hands-up-2.webp";
import genS36ThreeLines from "@/assets/generated/s36-three-lines.webp";
import genS38AboutToSend from "@/assets/generated/s38-about-to-send.webp";
import genS40Council from "@/assets/generated/s40-council.webp";
import genS09Ring from "@/assets/generated/s09-ring.webp";
import genS31ThreeDoors from "@/assets/generated/s31-three-doors.webp";

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
  | "matrix"
  | "surfaced"
  | "jobs"
  | "bio"
  // Scott's 2026-08-05 design pass, each replicating a slide of the
  // gtm-workshop cut: the stakes/verification 2x2, the reach staircase, the
  // harness container, the closed/open panel pair, and the connection pipeline.
  | "quadrant"
  | "ladder"
  | "frame"
  | "duo"
  | "flow";

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
   * What the card's link is called on screen. Defaults to "Evidence" — the
   * label the Bar's cards established — but a download card says "Download"
   * and a prompt card says "Open the prompt".
   */
  hrefLabel?: string;
  /**
   * A small line icon in a tinted chip above the title. Only the flat icon
   * cards use it; the keys are the ones IconChip knows how to draw.
   */
  icon?: "grid" | "database" | "terminal" | "book";
  /**
   * "bad" renders the card as a named failure mode: accent border, accent
   * title. The quadrant's two red boxes are the reason this exists.
   */
  tone?: "bad";
};

/** Axis labels for the quadrant layout. Cards fill the grid in reading order. */
export type Quadrant = {
  /** Left column, right column. */
  colLabels: [string, string];
  /** Top row, bottom row. */
  rowLabels: [string, string];
};

/** The labelled container the frame layout draws around its cards. */
export type Frame = {
  /** Top-left corner label, accent smallcaps. */
  label: string;
  /** Top-right corner note, faint smallcaps. */
  note?: string;
};

/** One side of the duo layout's panel pair. */
export type DuoPanel = {
  name: string;
  /** The badge beside the name — the panel's one-line character. */
  badge?: string;
  rows: { label: string; value: string }[];
  /** Marks under the first row's value, linked to each platform. */
  brands?: { brand: BrandKey; href: string }[];
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
  /**
   * The option whose underlying system is drawn at the reveal, on the same
   * polls.state flip that shows the result bars. Rendering, not content: the
   * node names live in SystemUnderScreen the way the dashboard scenery lives
   * in ScreenMock, and nothing here says more than the option's own body
   * already prints.
   */
  systemOptionId?: string;
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
   * A clock with nothing to submit.
   *
   * Opens no database connection. Kept for a beat that genuinely has nothing to
   * store, but it is no longer how the self-scoring exercises run: ninety
   * seconds that wrote nothing, returned nothing and showed the room nothing was
   * the reason this hour went flat.
   */
  | { id: string; seconds: number; mode: "timer"; placeholder?: never }
  /**
   * One integer, and the room's distribution of it.
   *
   * The row count a Done returns, or the number of things a plan invented. The
   * answer is stored on the submission and aggregated into `answer_tallies` by
   * trigger, so every person sees where they fall without anyone seeing whose
   * answer is whose.
   *
   * This is what carries job 1. Two defensible readings of "gone quiet" return
   * 634 and 834, and the histogram splits the room in half in front of itself.
   */
  | {
      id: string;
      seconds: number;
      mode: "count";
      /** What the box is asking for, printed above it. */
      question: string;
      /** Printed after the number, so "634" reads as 634 rows. */
      unit: string;
      placeholder?: never;
    }
  /**
   * Checkboxes over the section's own cards, scored out of their count.
   *
   * The items are not repeated here: `ExerciseLayout` hands the widget
   * `section.cards`, which are already the list being scored. Duplicating them
   * would put the same nine strings in the registry twice and let them drift.
   */
  | { id: string; seconds: number; mode: "checklist"; placeholder?: never };

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
  /**
   * Index into `rows` of the row the section teaches. A number rather than a
   * per-row flag because the content check in tests/registry-integrity.spec.ts
   * treats every quoted string inside `matrix` as a cell that must render.
   */
  highlight?: number;
  /**
   * Render the rows without the inset panel around the table. For sections
   * whose rows are the slide's content rather than a comparison — boxing them
   * reads as chrome (Scott's 2026-08-04 QA on the ingredients slide).
   */
  plain?: boolean;
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
 * One of the two apps an attendee works behind: the starter app from the kit,
 * or the one they brought. Scott's 2026-08-04 ruling replaced the six-job menu
 * with this choice.
 *
 * `id` matches the value `set_job()` accepts, so a rename has to land in the
 * migration as well. The card reuses the job/user fields the picker already
 * renders: `job` is the headline line, `user` the supporting one.
 */
export type Job = {
  id: "starter" | "own";
  verb: string;
  job: string;
  user: string;
};

/**
 * One stage of the development process on the loop slide.
 *
 * The stage names stay in sync by value with the `steps` strips on the five
 * step slides; a rename has to land in both places.
 */
export type LoopStage = {
  name: string;
  /**
   * The artifact the stage leaves behind, printed under PRODUCES.
   *
   * The only per-stage text. v15 removed the ADVANCES WHEN row: eighteen text
   * blocks on one slide buried the pathway, and each stage's gate is taught on
   * that stage's own slide.
   */
  produces: string;
};

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

/** One outbound reference on a GO DEEPER strip. `brand` draws its mark before the label. */
export type DeeperLink = { label: string; href: string; brand?: BrandKey };

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
 * Seventeen sections have one and twelve do not. The twelve are the polls,
 * the exercises, the demo and the placeholder, where the room is talking or
 * typing rather than reading.
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
  chart?: "ladder" | "scurve" | "gap" | "divergence";
  matrix?: Matrix;
  /**
   * Brand marks per matrix row, linked to each platform's offering. Indexed to
   * `matrix.rows`; an empty array is a row that names no platform.
   *
   * Section-level rather than inside `matrix`: the content check in
   * tests/registry-integrity.spec.ts treats every quoted string inside a
   * `matrix` block as a cell that must render as page text, and a brand key or
   * an href renders as an image and a link, not text.
   */
  rowBrands?: { brand: BrandKey; href: string }[][];
  split?: { label: string; title: string; body: string; image: StaticImageData }[];
  loopStages?: LoopStage[];
  prompts?: Prompt[];
  links?: LinkRef[];
  poll?: Poll;
  exercise?: Exercise;
  surfaced?: Surfaced;
  jobs?: Job[];
  quadrant?: Quadrant;
  frame?: Frame;
  duo?: DuoPanel[];
  /**
   * Render the prompt for whichever job this reader picked, above the exercise.
   *
   * A flag rather than content because the text cannot live in this file: it is
   * composed from their `profiles.job` and the Done they wrote, neither of which
   * exists until the class is running.
   */
  jobPrompt?: boolean;
};

/**
 * The deck, in order.
 *
 * Quoted from `Vibecoding-201-Edit1.pptx` (2026-08-05), Scott's re-cut of the
 * class: the narrative now runs reach → sorting the work → harness engineering
 * → choosing a working environment → evaluating your own project, and only then
 * enters Spec → Plan → Build → Test → Ship → Run. Where Edit1 and the older
 * v15/v16 deck files disagree, Edit1 wins. Scott's 2026-08-05 ruling on the
 * v15-only sections (the two mid-deck polls, idempotency, the breach test, the
 * credentials slide, done-count, the demo, insight-rule, homework, and the Q&A
 * poll) was to cut them and not restore them; his design pass the same evening
 * also cut invented-count, pick-your-job, test-and-ship, and nine-steps.
 *
 * The class produces the spec, the plan, and the project context files live;
 * Test, Ship, and Run are taught but not exercised. Job and schema strings are
 * still quoted from `../data/kit/jobs.md`, `../data/kit/schema.md` and
 * `../delivery/deal-set-ground-truth.md`: the words are Scott's and the
 * numbers are checkable.
 *
 * Three rules apply to every entry:
 *
 *   1. The deck teaches on its own. Anything the audience must learn is printed
 *      here or in a GO DEEPER strip; narration adds color and never carries
 *      content. (Inverted in v11 — earlier versions kept spoken lines off the
 *      slide, which left definitions nowhere a reader could find them.)
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
    lede: "Evolution from Vibecoding IC work to Agentic Engineering for GTM.",
    kicker: "Scott Ewalt · Founder, Cardinal Element",
    footnote: "Pavilion AI in GTM School",
    deeper: {
      claim: "This deck's own source code.",
      note: "Every claim in the next hour is checkable against it.",
      links: [
        {
          label: "github.com/skidubb/vibecoding-201",
          href: "https://github.com/skidubb/vibecoding-201",
          brand: "github",
        },
      ],
    },
    media: { image: genS01Doorway, speed: -0.12 },
  },

  {
    // `cold-open`, not `two-screens`: the id is the poll slug's twin and the
    // anchor two specs locate this section by. Edit1 moved the poll ahead of
    // the 101 slide, so the vote happens before the answer is framed.
    id: "cold-open",
    theme: "dark",
    layout: "poll",
    eyebrow: "Two screens",
    railLabel: "Two screens",
    title: "Which one runs Monday's retention meeting?",
    accent: "Monday's retention meeting?",
    lede: "Vote on this screen.",
    poll: {
      slug: "cold-open",
      variant: "two-up",
      // v13: at the reveal, the system under screen B appears beneath its
      // pixel-identical mock. Keyed to the reveal so the vote stays untainted.
      systemOptionId: "cold-open:b",
      options: [
        {
          id: "cold-open:a",
          label: "A",
          name: "Screen A",
          body: "Built in twelve minutes.",
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
    id: "what-changed",
    theme: "dark",
    layout: "claim",
    eyebrow: "101 · May 20",
    // Scott's 2026-08-04 QA: this title and kicker are his wording. The lede
    // ("cheap to build" / "where tools die") was cut as extra text.
    title: "You built a prototype in 101. Today, you'll build a system.",
    accent: "system.",
    railLabel: "What changed since 101",
    kicker:
      "A production system means someone depends on it: records that persist, access that is controlled, failures that are handled, behavior that is verified, and an owner with a name.",
    deeper: {
      claim:
        "Google's New SDLC whitepaper draws the same line between vibe coding and agentic engineering.",
      links: [
        {
          label: "The New SDLC With Vibe Coding",
          href: "https://www.kaggle.com/whitepaper-the-new-SDLC-with-vibe-coding",
          brand: "google",
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
    // Edit1 slide 4. The reach table is the deck's first new argument: the
    // rigor owed to a piece of work is set by who sees its output, not by how
    // hard it was to build.
    id: "reach",
    theme: "light",
    layout: "ladder",
    eyebrow: "More levels, more devils",
    title: "Surface area determines how much rigor you owe.",
    accent: "how much rigor you owe.",
    railLabel: "Surface area",
    lede: "Use one question: can you silently fix this after it is wrong? If the answer is no, the work needs explicit checks and a release gate.",
    // Bottom step first: the ladder draws them climbing up and to the right,
    // and the top step carries the accent border — the floor at its highest.
    cards: [
      {
        title: "Just me",
        body: "Eyeball the output. Correct or discard it quietly.",
      },
      {
        title: "My team",
        body: "Someone else reviews the result. Explain the correction to a small group.",
      },
      {
        title: "Whole org",
        body: "Written rules plus test data. Correct an operating decision and notify users.",
      },
      {
        title: "External facing",
        body: "Evals, release gates, monitoring, and rollback. Repair customer or partner trust.",
        tone: "bad",
      },
    ],
    footnote:
      "Enterprise is a multiplier: procurement and security review add obligations on top of the reach floor.",
    media: { image: genS19HandsUp, speed: -0.12 },
  },

  {
    // Edit1 slide 5. The 2x2 rendered as four cards: CardsLayout puts four
    // items in a two-column grid, and each card's meta line carries its
    // stakes/verification position so the axes survive the flattening.
    id: "sort-the-work",
    theme: "dark",
    layout: "quadrant",
    eyebrow: "Sort the work · evolution of Vibecoding",
    title:
      "Start with low-stakes individual work. Add verification as reach and consequence grow.",
    accent: "as reach and consequence grow.",
    railLabel: "Sort the work",
    lede: "The red boxes are the two failure modes.",
    quadrant: {
      colLabels: ["Low verification", "High verification"],
      rowLabels: ["High stakes", "Low stakes"],
    },
    // Reading order fills the grid: top-left, top-right, bottom-left,
    // bottom-right. The axes carry stakes and verification, so the cards do
    // not restate them.
    cards: [
      {
        title: "Danger zone",
        tone: "bad",
        body: "Lead scores written to CRM, a forecast rollup for the board, automated outbound sequences.",
      },
      {
        title: "Agentic engineering",
        body: "Pipeline health scoring, territory and quota models, rep-versus-buyer loss reconciliation.",
      },
      {
        title: "Vibe coding",
        body: "A win/loss theme explorer, a one-off QBR chart, a rep's private deal view.",
      },
      {
        title: "Over-engineered",
        tone: "bad",
        body: "A full eval suite for one chart, CI for a throwaway pull, a formal spec for a scratch script.",
      },
    ],
    kicker:
      "A lead-scoring model and a quota model are both code. The required checks come from consequence, not complexity.",
    media: { image: genS25TwoParcels, speed: -0.12 },
  },

  {
    // Edit1 slide 6. "Harness" here is the industry's literal term for the
    // system around the model, not deck-local vocabulary — Edit1 made it the
    // spine of the class, and the choose-environment table depends on it.
    id: "harness-engineering",
    theme: "light",
    layout: "frame",
    eyebrow: "Harness engineering",
    title: "Beyond prompting. The harness is the system.",
    accent: "The harness is the system.",
    railLabel: "Harness engineering",
    lede: "The model is only a small part of getting quality outputs. The harness is everything that makes the model useful, constrained, and verifiable.",
    frame: {
      label: "Coding harness",
      note: "~90% of the working system",
    },
    cards: [
      {
        title: "Model",
        meta: "~10%",
        body: "Generates and reasons. It may be swapped without changing the workflow.",
      },
      {
        title: "Context",
        body: "Repository, business rules, examples, and the current state of the work.",
      },
      {
        title: "Tools",
        body: "Computer use, APIs, MCP servers, terminal, CRM, warehouse, and browser.",
      },
      {
        title: "Sandbox",
        body: "Permissions, approvals, secrets boundaries, and allowed actions.",
      },
      {
        title: "Verification",
        body: "Checks, diffs, source rows, screenshots, logs, and human review.",
      },
    ],
    kicker:
      "When two products can swap models and still behave like themselves, the durable product is the harness.",
    deeper: {
      claim: "Model + harness is the practical architecture in Google's New SDLC paper.",
      links: [
        {
          label: "The New SDLC With Vibe Coding",
          href: "https://www.kaggle.com/whitepaper-the-new-SDLC-with-vibe-coding",
          brand: "google",
        },
      ],
    },
    media: { image: genS22SealedEnvelope, speed: -0.12 },
  },

  {
    // Edit1 slide 7. Both groups run the same data and assignment; the table
    // is the decision, and the brand marks on the Examples row link out to the
    // platforms it names. Base44 sponsors the class and sits with its peers.
    id: "choose-environment",
    theme: "dark",
    layout: "duo",
    eyebrow: "Choose your working environment",
    title: "Open or closed: use the harness you already trust.",
    accent: "the harness you already trust.",
    railLabel: "Your working environment",
    lede: "Both groups will use the same source data and assignment. The comparison is what each harness exposes, automates, and makes easy to verify.",
    duo: [
      {
        name: "Closed harness",
        badge: "Fast, guided start",
        rows: [
          { label: "Examples", value: "Lovable, v0, Replit Agent, Base44" },
          {
            label: "Who configures it",
            value:
              "The vendor chooses context strategy, tools, deployment, and recovery",
          },
          {
            label: "Best fit",
            value: "Fast starts and guided workflows",
          },
        ],
        brands: [
          { brand: "lovable", href: "https://lovable.dev" },
          { brand: "v0", href: "https://v0.app" },
          { brand: "replit", href: "https://replit.com" },
          { brand: "base44", href: "https://base44.com" },
        ],
      },
      {
        name: "Open harness",
        badge: "Direct, configurable work",
        rows: [
          { label: "Examples", value: "Claude Code, Codex, Antigravity, Cursor" },
          {
            label: "Who configures it",
            value:
              "Your team configures context, tools, permissions, deployment, and verification",
          },
          {
            label: "Best fit",
            value:
              "Multi-file work, direct data access, commands, and reusable automation",
          },
        ],
        brands: [
          { brand: "claude", href: "https://claude.com/product/claude-code" },
          { brand: "openai", href: "https://learn.chatgpt.com/docs" },
          { brand: "antigravity", href: "https://antigravity.google" },
          { brand: "cursor", href: "https://cursor.com" },
        ],
      },
    ],
    kicker:
      "Choose one now. We will compare correctness, evidence, repeatability, and recovery at the end.",
    media: { image: genS40Council, speed: -0.12 },
  },

  {
    // Edit1 slide 8. The first hands-on: the room points its own coding agent
    // at a project it already has and asks for a verdict. The prompt lives in
    // the kit so the slide never has to carry a wall of text.
    id: "evaluate-your-project",
    theme: "light",
    layout: "exercise",
    eyebrow: "Hands on · 5 minutes",
    title: "Evaluate one of your projects: is it a prototype, a tool, or a system?",
    accent: "a prototype, a tool, or a system?",
    railLabel: "Evaluate your project",
    cards: [
      {
        title: "Open your coding agent",
        body: "In the folder of something you have already built. Nothing to evaluate? Use the starter app from the kit.",
        href: "/kit/monday-gtm-dashboard-standalone.html",
        hrefLabel: "Download the starter app",
      },
      {
        title: "Run the evaluation prompt",
        body: "The agent reads the project and returns a verdict with the evidence that decided it.",
        href: "/kit/the-bar-prompt.md",
        hrefLabel: "Open the evaluation prompt",
      },
      {
        title: "Share the verdict",
        body: "Paste what came back. Share it if you want it in the mix.",
      },
    ],
    exercise: {
      id: "bar-eval",
      seconds: 300,
      placeholder:
        "Prototype, tool, or system — and the one piece of evidence that decided it.",
    },
    footnote: "The evaluation prompt is in the kit",
    footnoteHref: "/kit",
    media: { image: genS17OverShoulder, speed: -0.12 },
  },

  {
    // The working set, laid out before anything is picked or specced. This is
    // where the deal set stops appearing cold: it used to be first mentioned in
    // the headline of the slide that asked the room to use it. The set is
    // synthetic (Andy's Class 0 data) and the row says so; its defects are real
    // CRM defects, which is the pedagogy, so "real data" is never claimed.
    id: "ingredients",
    theme: "light",
    layout: "cards",
    // Scott's 2026-08-04 QA: never count the items ("three ingredients"), the
    // data is called CRM data rather than "the deal set", no row highlight,
    // and the table renders without its inset box (`plain`). His later ruling
    // the same day: the starter app is the thing you build with, and the CRM
    // data rides inside it.
    eyebrow: "Hands on starts now",
    title: "No app, no problem — use this",
    accent: "use this",
    railLabel: "The shared starting line",
    lede: "The PromptKit is the shared starting line. It gives every harness the same source, working interface, reference material, and verification baseline.",
    cards: [
      {
        icon: "grid",
        title: "The starter app",
        body: "A working GTM dashboard with the CRM data inside it. Download it, double-click the file, and it runs — no server, no account, no key.",
        href: "/kit/monday-gtm-dashboard-standalone.html",
        hrefLabel: "Download the app",
      },
      {
        icon: "database",
        title: "The CRM data",
        body: "10,000 deals across 36 columns, dated 4 August 2026, riding inside the starter app. Preserve it as the immutable source.",
        href: "https://storage.googleapis.com/vibecoding-201-data/deals-10k.csv",
        hrefLabel: "Open the full CSV",
      },
      {
        icon: "terminal",
        title: "Your coding harness",
        body: "The open or closed harness you chose. Point it at a copied workspace and keep its connection and evidence visible.",
      },
      {
        icon: "book",
        title: "PromptKit references",
        body: "Keep the prompt pack, the CLI reference, and the production readiness checklist open. Use the relevant guidance when the work reaches it.",
        href: "/kit",
        hrefLabel: "Open the kit",
      },
    ],
    kicker:
      "No one starts from a blank page — and no exercise writes back to the source.",
    // Scott's 2026-08-04 QA: no "schema", "bucket" or "read-only" without
    // saying what they mean. The links say what a reader gets when they click.
    deeper: {
      claim: "The starter app and its CRM data, explained.",
      note: "The app download, a guide to what every column means, and a 200-row sample you can paste straight into any AI assistant. No account needed for any of them.",
      links: [
        {
          label: "The column guide",
          href: "https://storage.googleapis.com/vibecoding-201-data/schema.md",
        },
        { label: "/kit", href: "/kit" },
      ],
    },
    media: { image: genS31ThreeDoors, speed: -0.12 },
  },

  {
    // The verdicts, tallied. Option bodies are the observable tests from the
    // deck's own table: the category is set by what you can observe, never by
    // the feature list.
    id: "evaluate-poll",
    theme: "dark",
    layout: "poll",
    eyebrow: "The room's verdicts",
    title: "Is it a prototype, a tool, or a system?",
    accent: "a system?",
    railLabel: "Prototype, tool, or system",
    lede: "Vote what your agent came back with.",
    poll: {
      slug: "evaluate",
      options: [
        {
          id: "evaluate:prototype",
          label: "A",
          name: "Prototype",
          body: "Demonstrates the idea with sample or temporary inputs. It changes belief.",
        },
        {
          id: "evaluate:tool",
          label: "B",
          name: "Tool",
          body: "A defined group reliably completes a real workflow. It changes the work.",
        },
        {
          id: "evaluate:system",
          label: "C",
          name: "System",
          body: "Runs across teams, data sources, permissions, time, and failure. It changes the business.",
        },
      ],
    },
    media: { image: genS27HandsUp2, speed: -0.12 },
  },

  {
    // Added in v9: four step slides referenced a six-step loop the deck never
    // introduced. This slide introduces it by name before the Spec step.
    // v13: the six card definitions became one pathway. Each stage prints
    // what it produces and what lets the work advance, and the return band
    // carries evidence from use back to Spec.
    id: "loop-overview",
    theme: "dark",
    layout: "loop",
    eyebrow: "How the next forty minutes are organized",
    title:
      "How a prototype becomes production: Spec, Plan, Build, Test, Ship, Run",
    accent: "Spec, Plan, Build, Test, Ship, Run",
    railLabel: "The development process",
    // Edit1 slide 10's transition line, folded in rather than kept as its own
    // slide: the question it asks is answered by this slide's title.
    lede: "Great, so how do I get from here to there? Spec-driven development.",
    loopStages: [
      { name: "Spec", produces: "The job, the user, and a checkable Done" },
      {
        name: "Plan",
        produces: "A reviewable proposal: data, permissions, tests, and files",
      },
      { name: "Build", produces: "The smallest working implementation" },
      {
        name: "Test",
        produces: "Repeatable evidence the workflow and its failure cases behave",
      },
      {
        name: "Ship",
        produces: "The approved version, live where people depend on it",
      },
      {
        name: "Run",
        produces: "Monitoring, alerts, a named owner, a rollback path",
      },
    ],
    kicker:
      "The agent can propose, implement, and test. A person stays accountable for scope, access, promotion, and operation.",
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
    // The spec the hour works, grounded in the starter app: its went-quiet
    // panel already draws this list without stating a definition, and writing
    // the definition is the exercise. The Done below is the worked example the
    // deck teaches from; the room writes its own in the next block.
    lede: "The starter app already draws this list — the panel named Went quiet. The definition the panel never states is what the Done supplies.",
    cards: [
      {
        title: "Job",
        body: "Identify open deals that have gone quiet, and list them by the rep who owns them.",
      },
      {
        title: "User",
        body: "A RevOps analyst who sends the list to sales managers on Monday morning.",
      },
      {
        title: "Done",
        body: "Open deals in Prospecting, Qualification, Proposal or Negotiation whose last activity date falls before 5 May 2026, grouped by rep, with the deals carrying no activity date counted separately.",
      },
    ],
    // The two readings that split a room. 200 open deals carry no
    // last_activity_date at all, so "gone quiet" returns 634 or 834 depending on
    // how one English sentence is read, and both readings are defensible.
    matrix: {
      head: ["Vague", "Testable"],
      rows: [
        [
          "Shows the stale deals",
          "Names the stages, names the date, and says what happens to the deals with no activity date at all.",
        ],
      ],
    },
    kicker:
      "If you cannot write the steps, you do not yet know what you are asking for.",
    // v15 moved "also specify: source data, access rules, failure behavior,
    // non-goals" off the slide face and into the GO DEEPER note — five
    // competing elements buried the one teach this slide exists for.
    deeper: {
      claim: "GitHub Spec Kit.",
      note: "Spec-driven development as a full toolchain. A full spec also covers source data, access rules, failure behavior, and non-goals.",
      links: [
        {
          label: "github/spec-kit",
          href: "https://github.com/github/spec-kit",
          brand: "github",
        },
        { label: "docs", href: "https://github.github.com/spec-kit" },
      ],
    },
    media: { image: genS11TwoSheets, speed: -0.12 },
  },

  {
    // v15 split the fifteen-minute assignment: this block writes the spec, and
    // firing the plan prompt is its own three-minute beat after the Plan slide.
    // The exercise id stays `spec` — the submissions table predates the split.
    id: "assignment",
    theme: "light",
    layout: "exercise",
    eyebrow: "Hands on · 8 minutes",
    steps: {
      all: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
      current: ["Spec"],
    },
    title: "Write your three-line spec: Job, User, Done",
    accent: "Job, User, Done",
    railLabel: "Write your spec",
    cards: [
      {
        title: "Job and User are given",
        body: "Job: identify open deals that have gone quiet, and list them by the rep who owns them. User: a RevOps analyst who sends the list to sales managers on Monday morning. On your own app: the job it already does, for the person who depends on it.",
      },
      {
        title: "The Done is yours",
        body: "Written as steps someone else could follow to check it.",
      },
      {
        title: "Submit it",
        body: "Share it if you want it in the mix.",
      },
    ],
    exercise: {
      id: "spec",
      seconds: 480,
      placeholder:
        "Job.\nUser.\nDone, written as steps someone else could follow to check it.",
    },
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
    lede: "A plan is a proposal you can read and question: how the agent intends to satisfy the spec.",
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
          brand: "claude",
        },
      ],
    },
    media: { image: genS10PagePassed, speed: -0.15 },
  },

  {
    // Split out of the fifteen-minute assignment in v15 so Plan has its own
    // hands-on beat. The prompt is printed a second time deliberately: the
    // slide it teaches on cannot be two slides back when the room needs to
    // paste it. No database exercise here; invented-count collects the return
    // after the demo has covered generation time.
    id: "plan-fire",
    theme: "dark",
    layout: "prompt",
    eyebrow: "Hands on · 3 minutes",
    steps: {
      all: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
      current: ["Plan"],
    },
    title: "Paste the plan prompt above your spec and fire it",
    accent: "fire it",
    railLabel: "Fire the plan prompt",
    prompts: [
      {
        id: "plan-approval-fire",
        label: "The plan prompt",
        text: "Inspect the current project. Propose the smallest coherent implementation for this specification. Identify the data model, permissions, environment variables, failure states, tests, and files involved. Do not change anything until I approve the plan.",
        caption:
          "Open your agent in the starter app folder from the kit — the project it inspects is one screen, the CRM data inside it, and a verification harness. Working on your own app, fire it in your own repository.",
      },
    ],
    kicker:
      "Send it, then leave it generating. Read what comes back before you approve any of it.",
    footnote: "No plan came back? Take the pre-generated one from the kit",
    footnoteHref: "/kit",
    media: { image: genS12Timer, speed: -0.15 },
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
    lede: "Create only the files this tool warrants. A one-screen tool does not need all six.",
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
      note: "readable by most coding agents rather than one vendor's. The kit carries a worked example of every file above, written for the starter app.",
      links: [
        { label: "agents.md", href: "https://agents.md" },
        { label: "Worked examples", href: "/kit" },
      ],
    },
    media: { image: genS18SixBinders, speed: -0.12 },
  },

  {
    id: "data-doors",
    theme: "dark",
    layout: "flow",
    eyebrow: "Build · connections",
    steps: {
      all: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
      current: ["Build"],
    },
    title: "Choose how your tool connects to its data",
    accent: "connects to its data",
    // The five methods as a pipeline of icon nodes: `body` is when to use one,
    // `meta` is what it costs you — the accent caution under each column.
    cards: [
      {
        title: "Manual",
        body: "Rare, ambiguous, or judgment-heavy work.",
        meta: "Costs you: stale data and human effort",
      },
      {
        title: "Computer use",
        body: "Stable interface, no usable integration.",
        meta: "Costs you: fragility and terms-of-service limits",
      },
      {
        title: "API",
        body: "App-to-app work at runtime.",
        meta: "Costs you: auth, rate limits, engineering overhead",
      },
      {
        title: "MCP",
        body: "Governed agent access to tools and context.",
        meta: "Costs you: connector quality and permissions",
      },
      {
        title: "CLI",
        body: "The agent driving GitHub, Vercel, Supabase, tests, logs.",
        meta: "Costs you: powerful access needs guardrails",
      },
    ],
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
    // v11: the two unfamiliar rows are defined in print; the note used to be
    // spoken.
    kicker:
      "MCP is the agent's native protocol for live connections. CLI is the agent driving another platform's own tools, and your agent already speaks every CLI.",
    deeper: {
      claim: "The MCP specification, and a list of free APIs worth building against.",
      note: "SEC EDGAR, Apify, and the rest — each with what it is for and what the free tier allows.",
      links: [
        {
          label: "modelcontextprotocol.io",
          href: "https://modelcontextprotocol.io/specification",
          brand: "mcp",
        },
        { label: "Free APIs for GTM tools", href: "/kit/free-apis.md" },
      ],
    },
    media: { image: genS23FiveEntrances, speed: -0.12 },
  },

  {
    // Scott's 2026-08-05 addition: a slide that makes test-driven development
    // executable rather than described. The prompt is §7 of the kit's prompt
    // pack, printed here so the room can paste it without leaving the deck.
    id: "tdd",
    theme: "dark",
    layout: "prompt",
    eyebrow: "Test · test-driven development",
    steps: {
      all: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
      current: ["Test"],
    },
    title: "A test that has never failed is not known to be testing anything",
    accent: "never failed",
    railLabel: "Test-driven development",
    lede: "Test-driven development, run by the agent: the test is written first, fails against the current code, and the implementation exists to turn it green.",
    prompts: [
      {
        id: "tdd",
        label: "The TDD prompt",
        text: "Write tests for this workflow covering: the happy path, an unauthorised access attempt, malformed input, a duplicate submission, an upstream failure, and persistence after a refresh. Confirm each test fails against the current code before you make it pass, and show me that failure.",
        caption:
          "You define the behaviour and you verify as a user. The agent writes the test, confirms it fails, implements, and runs it until green. You own the first step and the last one.",
      },
    ],
    kicker:
      "A bad response writes tests that pass immediately, or skips the unauthorised-access and duplicate-submission cases. Those two are where real tools break.",
    deeper: {
      claim: "The full prompt pack,",
      note: "with this prompt beside the reviews that follow it: security, error handling, and what happens when something runs twice.",
      links: [{ label: "/kit", href: "/kit" }],
    },
    media: { image: genS26LedgerAndNote, speed: -0.15 },
  },

  {
    // Keep this id. `CardsLayout` renders this site's own live event feed on it —
    // the slide argues for logging and then shows its own log, which is the
    // difference between teaching analytics and having them.
    id: "run",
    theme: "light",
    layout: "matrix",
    eyebrow: "Step 6 · Run",
    steps: {
      all: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
      current: ["Run"],
    },
    title: "Watch it, log it, and name who fixes it",
    accent: "name who fixes it",
    // Scott's 2026-08-05 reformat: the three jobs as a table, each row naming
    // the tools that do it, with their marks linked. Free-tier claims verified
    // live the same day.
    matrix: {
      head: ["", "What it answers", "Tools you can use"],
      rows: [
        [
          "Analytics",
          "Is it being used, and is it creating value?",
          "Vercel Analytics is one toggle on this stack. PostHog, Umami, and Google Analytics all have free tiers that cover an internal tool",
        ],
        [
          "Logs",
          "What happened on every run, for the day something looks wrong.",
          "Your platform's built-in logs first — Vercel's free plan forgets them after an hour. Sentry's free tier catches the errors you did not log",
        ],
        [
          "Alerts",
          "When it fails, a named human finds out. A log entry nobody reads is not an alert.",
          "Sentry alert rules, or your platform's uptime checks, pointed at a channel someone actually reads",
        ],
      ],
    },
    rowBrands: [
      [
        { brand: "vercel", href: "https://vercel.com/docs/analytics" },
        { brand: "posthog", href: "https://posthog.com" },
        { brand: "umami", href: "https://umami.is" },
        { brand: "google", href: "https://marketingplatform.google.com/about/analytics/" },
      ],
      [
        { brand: "sentry", href: "https://sentry.io" },
        { brand: "supabase", href: "https://supabase.com/docs/guides/telemetry/logs" },
      ],
      [{ brand: "sentry", href: "https://docs.sentry.io/product/alerts/" }],
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
          brand: "github",
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
    // Was a timer that wrote nothing. The nine checks are now checkboxes over
    // the cards above, so the score is stored, the unchecked items come back as
    // the homework in words, and the room sees how it scored as a whole.
    exercise: { id: "score", seconds: 90, mode: "checklist" },
    kicker:
      "Score a tool you have built, or score the starter app you worked in this hour. Check what it passes, leave the rest blank. The blanks are your homework.",
    deeper: {
      claim: "This site scored against all nine,",
      note: "with every link going to the thing itself, including the one it fails.",
      links: [
        {
          label: "github.com/skidubb/vibecoding-201",
          href: "https://github.com/skidubb/vibecoding-201",
          brand: "github",
        },
      ],
    },
    // A lateral drift past one person alone, then a pair, then a full room in
    // session — who depends on the thing. Moved here from the cut
    // prototype/tool/system table; this slide asks the same question.
    media: {
      video: "/media/three-environments.mp4",
      poster: "/media/three-environments-poster.jpg",
      speed: -0.15,
    },
  },

  {
    // Edit1 slide 22, moved from the front of the deck to the close: the
    // trends chart now lands after the method has been practised, as the
    // reason the method is verification-shaped. No media on purpose — the
    // chart layout renders no image backdrop, and a media block here would
    // fail the backdrop check in tests/registry-integrity.spec.ts.
    id: "evolution",
    theme: "light",
    layout: "chart",
    chart: "divergence",
    eyebrow: "Trends in AI development",
    title:
      "Frontier models require less step-by-step instruction. This continues to change how we prompt and how we guide agents to develop.",
    accent: "how we prompt and how we guide agents to develop.",
    railLabel: "Trends in AI development",
    kicker:
      "What follows is the best of our knowledge - August 6, 2026.",
    deeper: {
      claim: "Boris Cherny, who built Claude Code,",
      note: "deleted instructions, plan mode, and prompts release by release and never walked back verification.",
      links: [
        {
          label: "ycrootaccess.com",
          href: "https://www.ycrootaccess.com/p/boris-cherny-building-claude-code",
        },
        {
          label: "claude.com/blog",
          href: "https://claude.com/blog/running-an-ai-native-engineering-org",
          brand: "claude",
        },
      ],
    },
  },

  {
    // Edit1 slide 23. CtaLayout splits the title on ". " and delivers a line
    // at a time; the kicker is the presenter's name and the links are the two
    // ways to reach him.
    id: "keep-building",
    theme: "dark",
    layout: "cta",
    eyebrow: "Keep building",
    title: "Thank you.",
    railLabel: "Keep building",
    lede: "Questions, feedback, or want to compare harness outputs? Let's keep the conversation going.",
    kicker: "Scott Ewalt · Founder, Cardinal Element",
    links: [
      {
        label: "scott@cardinalelement.com",
        href: "mailto:scott@cardinalelement.com",
      },
      {
        label: "Scott Ewalt — LinkedIn",
        href: "https://www.linkedin.com/in/scottewalt/",
      },
    ],
    footnote: "The starter app, the prompts, and the CRM data are in the kit",
    footnoteHref: "/kit",
    media: { image: genS38AboutToSend, speed: -0.12 },
  },
];
