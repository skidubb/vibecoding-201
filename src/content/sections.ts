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
  | "jobs";

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
 * One of the six jobs from `../data/kit/jobs.md`.
 *
 * `id` matches the value `profiles.job` is constrained to, so a rename has to
 * land in the migration as well. The Job and the User are given and the Done is
 * deliberately absent: that is the part the room writes, and printing one here
 * would answer the question the next forty minutes ask.
 */
export type Job = {
  id: "identify" | "reconcile" | "route" | "prepare" | "summarize" | "approve";
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
  /** The artifact the stage leaves behind, printed under PRODUCES. */
  produces: string;
  /** What lets the work leave the stage, printed under ADVANCES WHEN. */
  advances: string;
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
 * Sixteen sections have one and twelve do not. The twelve are the polls, the
 * timers, the exercises and the demo, where the room is talking rather than
 * reading.
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
};

/**
 * The deck, in order.
 *
 * Twenty-eight sections, quoted from `deck-content-v14.md`.
 *
 * v14 is v13 with three sections out and three in. The running character, the
 * ninety-second self-scoring timer and the second showing of the route table
 * were cut; the job picker and the two counts replaced them. Everything they
 * introduce is quoted from `../data/kit/jobs.md`, `../data/kit/schema.md` and
 * `../delivery/deal-set-ground-truth.md`, which are now sources alongside the
 * deck for the same reason it was ever the source: the words are Scott's and
 * the numbers are checkable.
 *
 * Three rules from that file apply to every entry:
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
          brand: "github",
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
      "Production means someone depends on it: records that persist, access that is controlled, failures that are handled, behavior that is verified, and an owner with a name.",
    lede: "Everything you can see is cheap to build now. Everything underneath is where tools die.",
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
    // Was "Vote in the chat", which the deck inherited from before this site
    // existed. The slide it now renders on carries the poll, counts the votes
    // and draws the result, so the printed instruction pointed the room away
    // from the control in front of them.
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
    // Added in v11, moved from the close: the class teaches one route of four,
    // and saying so at minute five is the contract the rest of the hour is
    // read against. The detailed solves/still-yours table stays late, as
    // `routes`. v12 opens the lede with the four jobs a production tool does
    // and names the builders on row 2 — "An agent" on the face left the why
    // of the stack and the tools that build it unstated.
    id: "contract",
    theme: "dark",
    layout: "matrix",
    eyebrow: "The map · before the method",
    title: "There are four routes to production. This class teaches one.",
    accent: "This class teaches one.",
    railLabel: "The contract",
    lede: "A production tool stores real records, controls access, refreshes itself, and logs failures. Each route below is a different answer to who does those four jobs. Today teaches the assembled route because nothing on it is hidden. Learn to name the checks here and you can find them on any route.",
    matrix: {
      rows: [
        [
          "Stay in the platform you prototyped in",
          "Replit or Lovable carry the prototype through hosting, sign-in, and a database",
        ],
        [
          "Assemble the stack · today's route",
          "Claude Code, Codex, or Cursor builds the tool on GitHub, Vercel, and Supabase, every layer visible",
        ],
        [
          "Build on the cloud your company already runs",
          "Microsoft, Google, or AWS, alongside your engineering team",
        ],
        ["Buy it", "A vendor's product, with uptime on their payroll"],
      ],
      highlight: 1,
    },
    rowBrands: [
      [
        { brand: "replit", href: "https://replit.com" },
        { brand: "lovable", href: "https://lovable.dev" },
      ],
      [
        { brand: "claude", href: "https://claude.com/claude-code" },
        { brand: "openai", href: "https://developers.openai.com/codex" },
        { brand: "cursor", href: "https://cursor.com" },
        { brand: "github", href: "https://github.com" },
        { brand: "vercel", href: "https://vercel.com" },
        { brand: "supabase", href: "https://supabase.com" },
      ],
      [
        { brand: "microsoft", href: "https://azure.microsoft.com" },
        { brand: "google", href: "https://cloud.google.com" },
        { brand: "aws", href: "https://aws.amazon.com" },
      ],
      [],
    ],
    kicker:
      "On every route, the authorization rules, the final verification, and the named owner stay with your organization.",
    deeper: {
      claim: "The full route map:",
      note: "the nine checks covered per route, and five questions that pick one. Verified August 2026.",
      links: [{ label: "/kit", href: "/kit" }],
    },
    media: { image: genS31ThreeDoors, speed: -0.12 },
  },

  {
    // Added in v9 as the closing slide; moved forward in v11. The premise that
    // explains why the hour teaches checks instead of prompts belongs before
    // the method it frames. Rebuilt in v13: the capability table and the photo
    // are gone, and one figure draws the two movements a presenter stop at a
    // time, with the warning as the final beat. No media on purpose — the
    // chart layout renders no image backdrop, and a media block here would
    // fail the backdrop check in tests/registry-integrity.spec.ts.
    id: "evolution",
    theme: "light",
    layout: "chart",
    chart: "divergence",
    eyebrow: "Why this class teaches checks, not prompts",
    title:
      "Models require less instruction over time. Reliable systems require more explicit verification.",
    accent: "more explicit verification.",
    railLabel: "The premise",
    kicker:
      "An unverified multi-day agent run is the most expensive way to be wrong that exists today.",
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
    // The hinge of the hour, and what the fifteen-minute block used to spend
    // itself on. Every later beat operates on whichever of these the attendee
    // picks, so the choice is stored on their profile rather than held in a
    // component: it has to survive a reload and be readable from the page they
    // leave with.
    //
    // Every string is quoted from ../data/kit/jobs.md. The Done is missing from
    // all six on purpose. jobs.md prints "You write the Done" because that is
    // the part being practised, and printing one here would answer the question
    // the next forty minutes ask.
    id: "pick-your-job",
    theme: "light",
    layout: "jobs",
    eyebrow: "Six jobs · pick one",
    title: "Six jobs you can spec against the deal set",
    accent: "pick one",
    railLabel: "Pick your job",
    lede: "Starting points, not a menu. If you brought your own job, build that one.",
    jobs: [
      {
        id: "identify",
        verb: "Identify",
        job: "Identify open deals that have gone quiet, and list them by the rep who owns them.",
        user: "A RevOps analyst who sends the list to sales managers on Monday morning.",
      },
      {
        id: "reconcile",
        verb: "Reconcile",
        job: "Reconcile how a lost deal was coded internally against what the buyer said, and list the deals where the two disagree.",
        user: "A sales enablement lead preparing a quarterly loss review.",
      },
      {
        id: "route",
        verb: "Route",
        job: "Route open deals that have fewer than three known contacts to the rep's manager.",
        user: "A sales manager who wants them worked before the quarter closes.",
      },
      {
        id: "prepare",
        verb: "Prepare",
        job: "Prepare a weekly digest of quiet open pipeline for a single territory.",
        user: "The regional director for that territory, who reads it in a Monday email.",
      },
      {
        id: "summarize",
        verb: "Summarize",
        job: "Summarize one rep's closed-lost deals into a coaching note their manager can read in two minutes.",
        user: "A first-line sales manager preparing for a one-to-one.",
      },
      {
        id: "approve",
        verb: "Approve",
        job: "Approve for correction every deal whose expected close date falls before the deal was created.",
        user: "A RevOps administrator who will run the correction after someone signs off.",
      },
    ],
    kicker: "You write the Done. That is the part being practised, and the part that is hard.",
    // Where the room first meets the data, so the address belongs here rather
    // than only in the strip below.
    footnote: "The deal set: storage.googleapis.com/vibecoding-201-data",
    footnoteHref: "https://storage.googleapis.com/vibecoding-201-data/schema.md",
    deeper: {
      claim: "10,000 deals, 36 columns, no account and no key.",
      note: "Query it read-only, or paste the 200-row sample into whatever assistant you have.",
      links: [
        {
          label: "schema.md",
          href: "https://storage.googleapis.com/vibecoding-201-data/schema.md",
        },
        { label: "/kit", href: "/kit" },
      ],
    },
    media: { image: genS14TheQuestion, speed: -0.12 },
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
    loopStages: [
      {
        name: "Spec",
        produces: "The job, the user, and a checkable Done",
        advances: "You can write the steps you will check",
      },
      {
        name: "Plan",
        produces: "A reviewable proposal: data, permissions, tests, and files",
        advances: "You approve it before anything changes",
      },
      {
        name: "Build",
        produces: "The smallest working implementation",
        advances: "It stays inside the rules you set",
      },
      {
        name: "Test",
        produces: "Repeatable evidence the workflow and its failure cases behave",
        advances: "Every check passes and you verify as a user",
      },
      {
        name: "Ship",
        produces: "The approved version, live where people depend on it",
        advances: "A person promotes it, never a saved file",
      },
      {
        name: "Run",
        produces: "Monitoring, alerts, a named owner, a rollback path",
        advances: "Evidence from use feeds the next spec",
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
    // Job and User are quoted from job 1 in ../data/kit/jobs.md, which is the
    // file the room has open. The Done is the one the kit deliberately withholds:
    // jobs.md gives every job its Job and its User and says "You write the Done",
    // because that is the part being practised.
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
    // The beat the hour turns on.
    //
    // 200 of the open deals carry no `last_activity_date` at all, so "no
    // recorded activity since 5 May" returns 634 or 834 depending on whether a
    // deal with no date counts as having no activity. Both readings are
    // defensible English and both people think they are finished. The room
    // submits its numbers and the histogram prints the disagreement, which is
    // the argument of this class made by the room instead of by the presenter.
    //
    // Quoted from ../data/kit/jobs.md, which the room has open.
    id: "done-count",
    theme: "light",
    layout: "exercise",
    eyebrow: "Hands on · 2 minutes",
    steps: {
      all: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
      current: ["Spec"],
    },
    title:
      "If your number is different, your Done and this one are not asking the same question",
    accent: "not asking the same question",
    railLabel: "What your Done returns",
    lede: "Run your Done against the deal set and submit the number of rows it returns.",
    exercise: {
      id: "done-count",
      seconds: 120,
      mode: "count",
      question: "Rows your Done returns",
      unit: "rows",
    },
    kicker: "That difference is the exercise, not a mistake.",
    // The endpoint goes on the slide face, not only in the strip below it. This
    // slide asks the room to run something against the deal set, and the deck's
    // own rule is that anything the audience must act on is printed: a GO DEEPER
    // strip is never read aloud and is for people already ahead, so an attendee
    // following the slides had no way to reach the data the exercise needs.
    footnote: "The deal set: storage.googleapis.com/vibecoding-201-data",
    footnoteHref: "https://storage.googleapis.com/vibecoding-201-data/schema.md",
    deeper: {
      claim: "The six jobs, each with the number one precise Done returns.",
      links: [
        {
          label: "jobs.md",
          href: "https://storage.googleapis.com/vibecoding-201-data/jobs.md",
        },
      ],
    },
    media: { image: genS11TwoSheets, speed: -0.12 },
  },

  {
    id: "demo",
    theme: "light",
    layout: "cards",
    eyebrow: "Demonstration",
    title: "Watch the agent plan a change before it makes it",
    accent: "before it makes it",
    railLabel: "Live demo",
    lede: "What this demo proves: a reviewed plan catches wrong assumptions before they become code.",
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
    // The count the assignment asked the room to keep, now collected.
    //
    // Job 3 is the cleanest case in the set: the deal set has no manager column,
    // so a plan that routes anything to a rep's manager has invented the routing
    // target. Everyone who picked that job invented at least one, which makes the
    // distribution a fact about their plans rather than an opinion about them.
    //
    // The schema is the contract this counts against, quoted from
    // ../data/kit/schema.md.
    id: "invented-count",
    theme: "dark",
    layout: "exercise",
    eyebrow: "Hands on · 2 minutes",
    steps: {
      all: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
      current: ["Plan"],
    },
    title: "The plan invented it, and that invention is now yours to own",
    accent: "yours to own",
    railLabel: "What the plan invented",
    lede: "A table, a column, a status or a permission your plan named that the schema does not contain. Submit how many.",
    exercise: {
      id: "invented-count",
      seconds: 120,
      mode: "count",
      question: "Things your plan invented",
      unit: "assumptions",
    },
    kicker:
      "A zero usually means you did not look hard enough. The schema is the whole contract.",
    deeper: {
      claim: "The 36 columns, and the values each one holds.",
      links: [
        {
          label: "schema.md",
          href: "https://storage.googleapis.com/vibecoding-201-data/schema.md",
        },
      ],
    },
    media: { image: genS18SixBinders, speed: -0.15 },
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
    // v11: the identity-versus-permission distinction is printed now. It was a
    // spoken line after v9 cut its standalone slide, which left it nowhere a
    // reader could find it.
    kicker:
      "Signing in says who you are. The database decides what you may read. Hiding records in the interface is neither.",
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
      note: "and the breach class they prevent: 170+ apps on one prototyping platform shipped without them.",
      links: [
        {
          label: "authorization.sql",
          href: "https://github.com/skidubb/vibecoding-201/blob/main/supabase/tests/authorization.sql",
          brand: "github",
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
    steps: {
      all: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
      current: ["Build"],
    },
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
          brand: "owasp",
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
    steps: {
      all: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
      current: ["Build"],
    },
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
    // v11: the two unfamiliar rows are defined in print; the note used to be
    // spoken.
    kicker:
      "MCP is the agent's native protocol for live connections. CLI is the agent driving another platform's own tools, and your agent already speaks every CLI.",
    deeper: {
      claim: "The MCP specification itself.",
      note: "Worth reading if you are deciding what your company exposes to agents.",
      links: [
        {
          label: "modelcontextprotocol.io",
          href: "https://modelcontextprotocol.io/specification",
          brand: "mcp",
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
    steps: {
      all: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
      current: ["Build"],
    },
    title: "What happens if this runs twice?",
    accent: "runs twice?",
    lede: "Imports, webhooks, CRM writes, and scheduled jobs all repeat, and the duplicate they create stays invisible until a customer finds it.",
    strip: {
      items: [
        "An operation is idempotent when running it twice has the same effect as running it once.",
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
          brand: "stripe",
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
      "A competitor publishes pricing with no API. You need a reviewed snapshot every Monday.",
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
    eyebrow: "Build · win rate by contact count",
    steps: {
      all: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
      current: ["Build"],
    },
    title: "Code calculates, the model explains",
    accent: "the model explains",
    matrix: {
      head: ["What the code does", "What the model does"],
      rows: [
        [
          "Counts the deals, computes the win rate, and ranks them",
          "Explains why a number moved and recommends the next action",
        ],
        [
          "The same inputs produce the same number every run",
          "Grounded in numbers the code already produced, never inventing them",
        ],
        [
          "Can be audited and tested",
          "Turns the numbers into language a sales manager can act on",
        ],
      ],
    },
    // The trap, on real rows. Win rate climbs monotonically from one contact to
    // seven, and the deals recorded with zero contacts sit above the whole
    // trend, which is the shape that produces a confident wrong answer.
    lede: "Win rate runs from 25.0% at one known contact to 90.4% at seven. The deals recorded with zero contacts win 59.2%.",
    kicker:
      "Zero is not a measurement, it is an absence wearing a number. A finding the model invented has nothing behind it to audit.",
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
          brand: "vercel",
        },
        {
          label: "replit.com/blog",
          href: "https://replit.com/blog/introducing-agent-3-our-most-autonomous-agent-yet",
          brand: "replit",
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
      "Score a tool you have built. Check what it passes, leave the rest blank. The blanks are your homework.",
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
    media: { image: genS39NineItems, speed: -0.15 },
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
    footnote: "Your job, your numbers and your unchecked items are at /yours",
    footnoteHref: "/yours",
    deeper: {
      claim:
        "Checklist, prompt pack, agent instructions, ownership card, CLI reference, route map, and the deal set.",
      note: "No email.",
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
