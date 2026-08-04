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
 * Seventeen sections have one and thirteen do not. The thirteen are the polls,
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
 * Twenty-one sections, quoted from `deck-content-v16.md`.
 *
 * v16 replaces v15's six-stage walk with one starter app and three additions.
 * v15 taught the loop and spent 25 of its 60 minutes on Spec and Plan; nineteen
 * minutes were hands-on and none of them built anything, so an attendee left
 * with a spec, a plan they never read, and two counts. Here everyone forks the
 * same app, which saves nothing, has no sign-in, and reports a total that
 * quietly skips 200 rows, and adds each missing piece in a timed block. Every
 * block ends in something the attendee can see on their own screen.
 *
 * Cut from v15: pick-your-job, loop-overview, done-count, room-specs, plan-fire,
 * demo, invented-count, data-doors, idempotency, test-and-ship, breach-test,
 * run, harness, secrets, insight-rule. The six jobs and the connection map moved
 * to the kit; credentials fold into Addition 1 and the code/model division into
 * Addition 3, on the slides where the room needs them.
 *
 * Rules from that file apply to every entry:
 *
 *   1. The deck teaches on its own. Anything the audience must learn is printed
 *      here or in a GO DEEPER strip; narration adds color and never carries
 *      content.
 *   2. No sentence restates the one before it.
 *   3. Every headline has to make sense with the rest of the slide covered.
 *   4. Every slide stands on its own; a line that needs another slide repeats it.
 *   5. Every hands-on block ends in something the attendee can see. A submitted
 *      number is not proof; a page that behaves differently is.
 *   6. Say it straight. No metaphors, no dramatic one-liners. This restates the
 *      standing rule in CLAUDE.md and overrides the others where they conflict.
 */
export const sections: Section[] = [
  {
    id: "title",
    theme: "dark",
    layout: "hero",
    eyebrow: "Vibecoding 201",
    title: "Building Production GTM Tools",
    accent: "Production",
    lede: "One prototype, three additions, and a link you can send someone by the end of the hour.",
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
    // A placeholder until Scott writes it: the deck previously had no
    // credibility beat at all. The bracketed lines are a deliberate merge
    // blocker; this section must not reach production unfilled.
    id: "why-me",
    theme: "dark",
    layout: "cards",
    eyebrow: "Your instructor",
    title: "[SCOTT: one sentence that says why you]",
    railLabel: "Why me",
    cards: [
      { title: "[SCOTT: bullet 1, career line]" },
      { title: "[SCOTT: bullet 2, Cardinal Element]" },
      { title: "[SCOTT: bullet 3, what you run today]" },
    ],
    kicker:
      "This deck is built with the method it teaches, and its repo is public.",
    media: { image: genS17OverShoulder, speed: -0.12 },
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
    lede: "The interface is the cheap part now. What sits behind it is the work.",
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
      "An agent that runs for three days without a check is the most expensive way to be wrong that is currently available.",
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
    // The spine of v16. v15 had no equivalent: it taught a six-stage loop and
    // spent 25 of 60 minutes on the first two stages, so the room left with a
    // taxonomy rather than a capability. Three problems, three additions, and
    // the rest of the hour is the room performing the right-hand column.
    id: "three-additions",
    theme: "dark",
    layout: "matrix",
    eyebrow: "The three additions",
    title: "Three things separate a prototype from a tool people can use",
    accent: "a tool people can use",
    railLabel: "What a prototype is missing",
    matrix: {
      head: ["The problem", "What you see", "The addition"],
      rows: [
        [
          "It does not save anything",
          "Close the tab and the work is gone. State lives in the browser",
          "A database, so a record is still there after a refresh",
        ],
        [
          "Anyone with the link can see everything",
          "No sign-in. The URL is the only control",
          "Sign-in, plus rules on the table that decide who reads what",
        ],
        [
          "It does not tell you when it is wrong",
          "A confident number, no indication that some rows were skipped",
          "Counts and messages for every row the tool could not handle",
        ],
      ],
    },
    lede: "Almost every problem you will hit is one of these three. Add all three and you have a tool other people can use.",
    kicker:
      "You are going to do this to one app, on your own machine, in the next forty minutes: three additions, eight minutes each.",
    media: { image: genS09Ring, speed: -0.12 },
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
    // v15: the answer is printed. The slide implied it and Scott's arc for the
    // hour states it as a beat: should everything be a production system? No.
    kicker:
      "The three additions are what move a prototype to a tool. Plenty of prototypes should stay prototypes, and those are cheap to abandon.",
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
    // Replaces `ingredients` and `pick-your-job`. Six jobs meant six unlike
    // exercises and six distributions that could not be read against each other;
    // one starter app means every later beat runs against the same object, and
    // the before picture on `cold-open` is the same app as the after picture on
    // `the-bar`. The set is synthetic (Andy's Class 0 data) and the row says so.
    id: "starter-app",
    theme: "light",
    layout: "matrix",
    eyebrow: "What you are forking",
    title: "Pipeline Review: a working app that is missing all three",
    accent: "missing all three",
    railLabel: "Your starter app",
    lede: "It reads Andy's deal set, finds open deals that have gone quiet, and lists them by rep. It works. It is also a fair description of most prototypes.",
    matrix: {
      rows: [
        [
          "Nothing is saved",
          "Results live in the browser. Refresh and they are gone",
        ],
        [
          "No sign-in",
          "Anyone with the URL can read every record",
        ],
        [
          "No handling for bad rows",
          "200 open deals carry no activity date. It counts them as active and shows a total with no indication",
        ],
      ],
      highlight: 2,
    },
    kicker: "Fork it now. One click, no account, no key.",
    deeper: {
      claim: "The deal set: 10,000 synthetic deals, 36 columns.",
      note: "Courtesy of Andy from the Class 0 data set. Schema and a 200-row sample.",
      links: [
        {
          label: "schema.md",
          href: "https://storage.googleapis.com/vibecoding-201-data/schema.md",
        },
        { label: "/kit", href: "/kit" },
      ],
    },
    media: { image: genS31ThreeDoors, speed: -0.12 },
  },
  {
    // v15 gave Spec and Plan three slides and two exercises across 25 of the 60
    // minutes. Here they are one teach slide and one six-minute block: enough to
    // practise the motion, not enough to crowd out the three additions. The
    // prompt id stays `plan-approval` because tests/helpers.ts locates it.
    id: "spec-and-plan",
    theme: "light",
    layout: "prompt",
    eyebrow: "Before the agent touches anything",
    title: "Say what done looks like, then make the agent show you its plan",
    accent: "show you its plan",
    railLabel: "Spec and plan",
    lede: "Your spec is three lines. Job, User, Done. The Done is written as steps someone else could follow to check it.",
    prompts: [
      {
        id: "three-line-spec",
        label: "The spec, for the starter app",
        text: "Job. Flag open deals that have gone quiet, listed by the rep who owns them.\n\nUser. A RevOps analyst who sends the list to sales managers on Monday morning.\n\nDone. Open deals in Prospecting, Qualification, Proposal or Negotiation whose last activity falls before 5 May 2026, grouped by rep, with deals carrying no activity date counted separately and labeled.",
        caption:
          "Working on your own project instead? Replace all three lines. The Done is the one that has to read as steps another person could follow.",
      },
      {
        id: "plan-approval",
        label: "The plan prompt",
        text: "Inspect the current project. Propose the smallest coherent implementation for this specification. Identify the data model, permissions, environment variables, failure states, tests, and files involved. Do not change anything until I approve the plan.",
        caption:
          "The last sentence is the whole prompt. Without it the agent starts typing while it is still guessing.",
      },
    ],
    deeper: {
      claim: "Spec-driven development as a full toolchain, and the open format for agent instructions.",
      links: [
        {
          label: "github/spec-kit",
          href: "https://github.com/github/spec-kit",
          brand: "github",
        },
        { label: "agents.md", href: "https://agents.md" },
      ],
    },
    media: { image: genS10PagePassed, speed: -0.15 },
  },
  {
    // The exercise id stays `spec` — the submissions table predates v16, and an
    // attendee's spec is still the thing being written and optionally shared.
    id: "spec-plan-block",
    theme: "dark",
    layout: "exercise",
    eyebrow: "Hands on · 6 minutes",
    title: "Point your agent at your fork and make it plan before it builds",
    accent: "plan before it builds",
    railLabel: "Write the spec, fire the plan",
    cards: [
      {
        title: "Open your fork in your agent",
        body: "Claude Code, Codex, or Cursor, whichever you set up in 101.",
      },
      {
        title: "Paste the spec, then the plan prompt",
        body: "Send it, and read what comes back.",
      },
      {
        title: "Find one thing it invented",
        body: "A table, a column, or a permission the data does not contain.",
      },
    ],
    exercise: {
      id: "spec",
      seconds: 360,
      placeholder:
        "Job.\nUser.\nDone, written as steps someone else could follow to check it.",
    },
    kicker:
      "Do not approve it yet. Stuck? The kit has a written spec and a pre-generated plan.",
    media: { image: genS12Timer, speed: -0.12 },
  },
  {
    // Addition 1. Carries the credentials material because this is the first
    // slide where the room needs a key: v15 taught secrets on a standalone slide
    // sixty seconds long, two slides away from the exercise that needed them.
    id: "nothing-saved",
    theme: "light",
    layout: "matrix",
    eyebrow: "Addition 1 · a database",
    title: "Close the tab and the work is gone",
    accent: "the work is gone",
    railLabel: "Nothing is saved",
    lede: "The starter app holds its results in the browser. Refresh and you are back to an empty screen. Every prototype does this, and it is the first thing a colleague notices when you hand it over.",
    matrix: {
      head: ["", "What it holds"],
      rows: [
        [".env.local", "The real values. Never leaves your machine"],
        [".env.example", "The names only. Safe to commit"],
      ],
    },
    kicker: "A tool writes to a database. A row that is still there after a refresh is what separates this from a demo.",
    footnote:
      "Credentials never go in GitHub or in browser code. An exposed key gets revoked and rotated, not hidden.",
    deeper: {
      claim: "What happens when the same write runs twice.",
      note: "Stripe's idempotency keys are the reference implementation, and the reason your card is not charged twice.",
      links: [
        {
          label: "docs.stripe.com",
          href: "https://docs.stripe.com/api/idempotent_requests",
          brand: "stripe",
        },
      ],
    },
    media: { image: genS22SealedEnvelope, speed: -0.15 },
  },
  {
    // Addition 1, performed. The check is the whole block: a refresh that keeps
    // the results is something the attendee sees on their own screen, which is
    // the fifth rule in deck-content-v16.md. A submitted number is not proof.
    id: "save-results",
    theme: "dark",
    layout: "exercise",
    eyebrow: "Hands on · 8 minutes · Addition 1",
    title: "Write the results to a database, then refresh the page",
    accent: "then refresh the page",
    railLabel: "Save the results",
    cards: [
      { title: "Run a review", body: "Whatever your app already does." },
      { title: "Refresh the page", body: "The browser reload, not a re-run." },
      {
        title: "Your results are still there",
        body: "Screenshot it. That is the first of three.",
      },
    ],
    prompts: [
      {
        id: "save-results-prompt",
        label: "Paste this into your agent",
        text: "Connect this app to a Supabase table. When a review runs, save the result with a timestamp and a run ID. On load, show the most recent saved run. Put the credentials in .env.local, add a .env.example with names only, and confirm .env.local is gitignored.",
        caption:
          "Stuck? The kit has the migration and the connection code. Take them and keep moving.",
      },
    ],
    exercise: { id: "save-results", seconds: 480, mode: "timer" },
    media: { image: genS12Timer, speed: -0.12 },
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
    // Addition 2. The teach slide, immediately before the room does it. The
    // sentence about hiding rows in the interface is the most common
    // misunderstanding in a GTM room and a good number have shipped it.
    id: "link-open",
    theme: "dark",
    layout: "claim",
    eyebrow: "Addition 2 · sign-in and access rules",
    title: "Your app now stores real records and has no sign-in",
    accent: "and has no sign-in",
    railLabel: "Anyone with the link",
    lede: "Anyone with the URL can read all of them. That was acceptable when nothing was saved. It is not acceptable now.",
    strip: {
      items: [
        "Signing in says who you are.",
        "Access rules decide what you may read.",
        "Hiding rows in the interface does neither, because the data still goes over the wire.",
      ],
    },
    kicker:
      "The rule belongs on the table, not in the page. A policy on the table refuses the request no matter which page, script, or curl command asks.",
    deeper: {
      claim: "What this prevents.",
      note: "170+ apps on one prototyping platform shipped without it, and their records were readable by anyone who looked.",
      links: [
        {
          label: "mattpalmer.io",
          href: "https://mattpalmer.io/posts/2025/05/CVE-2025-48757",
        },
      ],
    },
    media: { image: genS21WrongSide, speed: -0.15 },
  },
  {
    // Addition 2, performed. v15 ran this as two clicks on the presenter's own
    // deployed app; here the attendee builds the policy and then fails to get
    // past it themselves, which is the difference between watching a security
    // test and passing one.
    id: "add-signin",
    theme: "light",
    layout: "exercise",
    eyebrow: "Hands on · 8 minutes · Addition 2",
    title: "Add sign-in and a table policy, then try to read your data while signed out",
    accent: "while signed out",
    railLabel: "Add sign-in and rules",
    cards: [
      { title: "Sign in and run a review", body: "You see your own result." },
      {
        title: "Open the same URL in an incognito window",
        body: "Same address, no session.",
      },
      {
        title: "It refuses you",
        body: "Screenshot the refusal. That is the second of three.",
      },
    ],
    prompts: [
      {
        id: "add-signin-prompt",
        label: "Paste this into your agent",
        text: "Add Supabase auth to this app. Attach the signed-in user ID to every saved run. Enable row level security on the table with a policy that lets a user read only their own runs. Redirect signed-out visitors to a login screen.",
        caption:
          "Stuck? The kit has the policy SQL and the auth setup, plus one curl command that settles whether your rule is on the table or in your interface.",
      },
    ],
    exercise: { id: "add-signin", seconds: 480, mode: "timer" },
    media: { image: genS19HandsUp, speed: -0.12 },
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
    // Addition 3, taught. The longest teach slide in v16 at three minutes, and
    // the one nobody else teaches. The number on the room's own screen is the
    // case: 200 open deals carry no last_activity_date, so "quiet since 5 May"
    // is 634 or 834, and the starter app picks one without saying which.
    id: "not-telling",
    theme: "light",
    layout: "matrix",
    eyebrow: "Addition 3 · counts and messages",
    title: "Your app is showing a total right now that skips 200 deals without saying so",
    accent: "without saying so",
    railLabel: "It does not tell you when it is wrong",
    lede: "200 of the open deals in the set carry no activity date. The app counts them as active. The total on screen has no note, no warning, and no way for the reader to know.",
    matrix: {
      head: ["What the code should do", "What the model should do"],
      rows: [
        [
          "Count the deals and compute the total",
          "Explain what moved and what to do next",
        ],
        [
          "Same inputs, same number, every run",
          "Work from numbers the code produced, never its own",
        ],
        [
          "Can be audited and tested",
          "Turn the number into language a manager can act on",
        ],
      ],
    },
    kicker:
      "Every row your tool cannot classify has to be counted and shown. A number that quietly excludes rows is worse than no number, because people act on it.",
    deeper: {
      claim: "The full picture on this data.",
      note: "Win rate runs from 25.0% at one known contact to 90.4% at seven, and deals recorded with zero contacts win 59.2%. Zero contacts is a missing record, not a finding.",
      links: [
        {
          label: "schema.md",
          href: "https://storage.googleapis.com/vibecoding-201-data/schema.md",
        },
      ],
    },
    media: { image: genS26LedgerAndNote, speed: -0.15 },
  },
  {
    // Addition 3, performed. This is the beat v15 ran as a histogram that split
    // the room 634 against 834 and proved everyone had been sloppy. Same defect
    // in the same data, inverted: it is now a bug in the app the attendee finds
    // and fixes, and their total changes in front of them.
    id: "show-gaps",
    theme: "dark",
    layout: "exercise",
    eyebrow: "Hands on · 7 minutes · Addition 3",
    title: "Make the app show the rows it skipped, and say why",
    accent: "and say why",
    railLabel: "Show what it could not handle",
    cards: [
      {
        title: "Run a review",
        body: "The excluded count is on screen, next to the total.",
      },
      { title: "Submit a broken row", body: "The kit has three, each broken differently." },
      {
        title: "It tells you what it rejected",
        body: "In words. Screenshot it. That is the third of three.",
      },
    ],
    prompts: [
      {
        id: "show-gaps-prompt",
        label: "Paste this into your agent",
        text: "Count open deals with no activity date separately and display that count next to the total, labeled. If a queried or uploaded row is malformed, do not skip it silently: catch it, count it, and show the user what was rejected and why, in plain language.",
        caption:
          "Stuck? The kit has the error-handling pattern and three malformed rows to test with.",
      },
    ],
    exercise: { id: "show-gaps", seconds: 420, mode: "timer" },
    media: { image: genS28GreenLights, speed: -0.12 },
  },
  {
    id: "the-bar",
    theme: "dark",
    layout: "exercise",
    eyebrow: "Fifty minutes ago this was Screen A",
    title: "You have a tool. Here is what it now passes.",
    accent: "what it now passes.",
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
        title: "Enforced access rules",
        body: "The database decides what each user may see. Hiding records in the interface is not security.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/supabase/tests/authorization.sql",
      },
      {
        title: "Server-side credentials",
        body: "Credentials never appear in code. The repository holds references to a vault, never values.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/.env.op",
      },
      {
        title: "A tested critical workflow",
        body: "The main workflow runs under an automated test on every change.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/.github/workflows/ci.yml",
        met: false,
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
        met: false,
      },
      {
        title: "Preview before production",
        body: "A person promotes each change. Saving a file is not shipping.",
        href: "https://github.com/skidubb/vibecoding-201/blob/main/ARCHITECTURE.md",
        met: false,
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
      "Five in fifty minutes. Drop your link in chat: not for me, but so you can see how many of these exist that did not an hour ago.",
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
          body: "Hold. Nothing is saved, anyone with the link sees everything, and nobody has checked what it skips",
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
